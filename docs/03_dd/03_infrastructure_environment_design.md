# インフラ・環境詳細設計書

## 1. ミドルウェア設定詳細

### 1.1. 本番環境 (Cloud Run)

Cloud Runコンテナ内でCloud Storage FUSEを利用し、SQLiteデータベースファイルをマウントする。

#### `Dockerfile` (抜粋)

```Dockerfile
# Install gcsfuse and necessary certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    gnupg \
    lsb-release \
    curl && \
    export GCSFUSE_REPO=gcsfuse-`lsb_release -c -s` && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt $GCSFUSE_REPO main" | tee /etc/apt/sources.list.d/gcsfuse.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && \
    apt-get update && \
    apt-get install -y gcsfuse && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ... (中略)

# 起動スクリプト
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
```

#### `entrypoint.sh`

```bash
#!/bin/bash
set -e

# GCS FUSEのマウント
# GCS_BUCKET_NAMEはCloud Runの環境変数で設定
gcsfuse --implicit-dirs -o allow_other ${GCS_BUCKET_NAME} /mnt/gcs

# Next.jsアプリケーションの起動
exec npm start
```

### 1.2. 開発環境

`docker-compose.yaml` を使用して開発環境を構築する。

#### `docker-compose.yaml`

```yaml
version: '3.8'
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./:/app
      - /app/node_modules
      - ./data:/app/data # DBファイルと画像ファイルをマウント
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      # 開発用の環境変数をここに定義
      - DATABASE_URL=file:./data/dev.db
      - GCS_EMULATOR_HOST=http://fake-gcs-server:4443
      - GCS_BUCKET_NAME=local-bucket

  # (任意) ローカルでGCSをエミュレートする場合
  # fake-gcs-server: 
  #   image: fsouza/fake-gcs-server
  #   ports:
  #     - "4443:4443"
  #   volumes:
  #     - ./data:/data
  #   command: -scheme http -public-host localhost
```

## 2. ネットワーク構成詳細

- **Cloud Run:** デフォルトで全ての受信トラフィックがHTTPS経由となるため、追加のファイアウォールルールは不要。
- **ロードバランサー:** Cloud Runに組み込まれたマネージドロードバランサーを利用するため、個別の設定は不要。

## 3. セキュリティ設計詳細

### 3.1. 管理者認証フロー

Next.jsのミドルウェア (`middleware.ts`) を使用して `/admin` 配下へのアクセスを制御する。

#### `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATH = '/admin';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session');

  // /admin配下へのアクセスで、セッションクッキーがない場合はログインページへリダイレクト
  if (request.nextUrl.pathname.startsWith(ADMIN_PATH)) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // TODO: サーバーサイドでセッションを検証するAPIを呼び出し、
  // 有効でない場合や管理者権限がない場合はリダイレクトする処理を追加

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*', 
};
```

### 3.2. 管理者アカウント管理

管理者として許可するGoogleアカウントのメールアドレスは、Cloud Runの環境変数 `ADMIN_EMAIL_LIST` にカンマ区切りで設定する。
アプリケーションは起動時にこの環境変数を読み込み、認証後のユーザーのメールアドレスがリストに含まれているかを確認する。

**環境変数例:** `ADMIN_EMAIL_LIST=user1@example.com,user2@example.com`

### 3.3. 開発環境での認証

開発環境 (`NODE_ENV=development`) では、Google OAuthのセットアップを不要とし、開発効率を向上させるために認証をモック（模擬）する。

- **実装方針:** 認証を処理するモジュール (例: `lib/auth/`) は、開発環境の場合、常に特定の管理者ユーザー情報 (例: `{ id: 1, name: 'dev-user', email: 'dev@example.com' }`) がセッションに存在するかのように動作する。
- **ミドルウェア:** `middleware.ts` は、開発環境では認証チェックをスキップし、常にアクセスを許可する。
- **メリット:** これにより、開発者は実際の認証フローを都度行うことなく、管理者ページの機能開発に集中できる。
- **補足:** 本番環境と同様の認証フローをテストする必要がある場合は、Firebase Local Emulator Suiteの導入を別途検討する。

## 4. CI/CDパイプライン詳細

GitHub Actionsを使用してCI/CDパイプラインを構築する。

### 4.1. CI (継続的インテグレーション)

`.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches:
      - main
    paths:
      - 'apps/web/**'
      - '.github/workflows/ci.yml'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test -- --coverage

      - name: Docker build check
        working-directory: ./apps/web
        run: docker build -f Dockerfile -t shanari-gemini-ci-build-check .
```

### 4.2. CD (継続的デリバリー)

`.github/workflows/cd.yml`

```yaml
name: CD

on:
  push:
    branches:
      - main
    paths:
      - 'apps/web/**'
      - '.github/workflows/cd.yml'

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: 'google-github-actions/auth@v1'
        with:
          workload_identity_provider: '${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}'
          service_account: '${{ secrets.GCP_SERVICE_ACCOUNT }}'

      - name: Set up Cloud SDK
        uses: 'google-github-actions/setup-gcloud@v1'

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ secrets.GCP_REGION }}-docker.pkg.dev

      - name: Build and push container image
        working-directory: ./apps/web
        run: |
          IMAGE_ID=${{ secrets.GCP_REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/shanari-gemini/app
          docker build -t $IMAGE_ID:${{ github.sha }} -t $IMAGE_ID:latest .
          docker push $IMAGE_ID:${{ github.sha }}
          docker push $IMAGE_ID:latest
```

**必要なGitHub Secrets:**
- `GCP_PROJECT_ID`: Google CloudプロジェクトID
- `GCP_REGION`: Cloud Runをデプロイするリージョン (例: `asia-northeast1`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload Identity連携用のプロバイダー名
- `GCP_SERVICE_ACCOUNT`: GitHub ActionsからGCPへの認証に使用するサービスアカウントのメールアドレス。このサービスアカウントには`Artifact Registry Writer`のロールが必要です。
- `GCS_BUCKET_NAME`: SQLiteファイルや画像を保存するGCSバケット名
- `ADMIN_EMAIL_LIST`: 管理者として許可するGoogleアカウントのメールアドレスリスト

```