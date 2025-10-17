# shanari-gemini 個人サイトプロジェクト

このプロジェクトは、Geminiによって管理されている個人サイトです。

## 開発環境のセットアップ

### 前提条件

- [Docker](https://docs.docker.com/get-docker/)
- Docker Compose

### 開発サーバーの起動手順

1.  このリポジトリをクローンします。
2.  以下のコマンドを実行して、開発環境を起動します。

    ```bash
    docker compose up --build
    ```

3.  ブラウザで [http://localhost:3000](http://localhost:3000) を開き、動作を確認します。

`apps`ディレクトリ内のソースファイルを変更すると、アプリケーションは自動的にリロードされます。

## テストの実行

ローカル環境でテストを実行するには、まず`apps/web`ディレクトリに移動してください。

```bash
cd apps/web
```

### すべてのテストを実行

```bash
npm run test
```

### 特定のテストファイルを実行

テストファイルへのパスを指定して、個別のテストを実行することも可能です。

```bash
npm test -- src/__tests__/api/posts.test.ts
```

## Storybook

コンポーネントライブラリを視覚的に確認・テストするためにStorybookを使用します。

`apps/web`ディレクトリ内で以下のコマンドを実行してください。

```bash
npm run storybook
```

実行後、自動的にブラウザで [http://localhost:6006](http://localhost:6006) が開き、Storybookの画面が表示されます。

## CI/CD パイプライン

このプロジェクトでは、GitHub Actionsを使用してCI/CDパイプラインを構築しています。

### CI (継続的インテグレーション)

- **目的:** `main`ブランチにマージされる前のコード品質を保証します。
- **トリガー:** `main`ブランチをターゲットとした`pull_request`作成・更新時。実行は`apps/web/`配下、または関連するワークフローファイルに変更があった場合に限定されます。
- **実行内容:**
    - ESLintによるコード静的解析 (`npm run lint`)
    - Jestによる単体テスト (`npm run test`)

### CD (継続的デリバリー)

- **目的:** `main`ブランチの最新のコードを本番環境のCloud Runへ自動でデプロイします。
- **トリガー:** `main`ブランチへの`push`時（Pull Requestのマージなど）。実行は`apps/web/`配下、または関連するワークフローファイルに変更があった場合に限定されます。
- **実行内容:**
    1.  Dockerイメージをビルドします。
    2.  ビルドしたイメージをGoogle Artifact Registryにプッシュします。
    3.  新しいイメージをGoogle Cloud Runにデプロイします。

#### CDパイプラインの設定

CDパイプラインを有効にするには、事前にGitHubリポジトリに以下のシークレットを設定する必要があります。

##### 設定手順

1.  対象のGitHubリポジトリで、`Settings` > `Secrets and variables` > `Actions` に移動します。
2.  `New repository secret`ボタンを押し、以下のシークレットを一つずつ登録します。

##### 必要なシークレット

| シークレット名                      | 説明                                                                                                                                                                                                                               | 設定例                                                                              |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`                    | Google CloudプロジェクトのID。                                                                                                                                                                                                     | `my-gcp-project-12345`                                                              |
| `GCP_REGION`                        | リソースをデプロイするGCPリージョン。                                                                                                                                                                                               | `asia-northeast1`                                                                   |
| `GCP_SERVICE_ACCOUNT`               | GitHub ActionsからGCPへの認証に使用するサービスアカウントのメールアドレス。このサービスアカウントには以下のロールが必要です:<br>• `Artifact Registry Writer` (イメージのプッシュ)<br>• `Cloud Run Admin` (サービスのデプロイ)<br>• `IAM Service Account User` (Cloud RunサービスにSAを割り当てるため) | `github-actions-runner@my-gcp-project-12345.iam.gserviceaccount.com`                |
| `GCP_WORKLOAD_IDENTITY_PROVIDER`    | GCPのWorkload Identity連携で設定したプロバイダー名。                                                                                                                                                                               | `projects/1234567890/locations/global/workloadIdentityPools/my-pool/providers/my-provider` |
| `GCS_BUCKET_NAME`                   | アプリケーションが使用するGoogle Cloud Storageのバケット名。                                                                                                                                                                     | `my-app-storage-bucket`                                                             |
| `ADMIN_EMAIL_LIST`                  | アプリケーションの管理者として許可するGoogleアカウントのメールアドレス（カンマ区切り）。                                                                                                                                     | `admin1@example.com,admin2@example.com`                                             |

これらのシークレットを設定することで、GitHub Actionsは安全にGCPへ認証し、コンテナイメージのプッシュやデプロイを実行できるようになります。

## 管理者認証の設定 (Google Cloud Identity Platform)

本アプリケーションの管理者ページ (`/admin`) は、Google Cloud Identity Platformを利用したOAuth 2.0認証で保護されています。以下に認証を有効にするための設定手順を記載します。

### 認証フローの概要

1.  **Identity Platformの有効化:** Google CloudプロジェクトでIdentity Platformを有効にし、認証プロバイダーとしてGoogleを設定します。
2.  **Firebase SDKのクライアント設定:** クライアント（ブラウザ）側で認証処理を簡単かつ安全に実装するために、Google推奨のFirebase SDKを利用します。そのための設定情報を取得します。
3.  **クライアント側での認証:** Next.jsアプリケーション側でFirebase SDKを使い、Googleログイン処理を実装します。ユーザーがログインすると、IDトークンが取得されます。
4.  **サーバー側でのセッション生成:** 取得したIDトークンをサーバーサイドAPI (`/api/auth/login`) に送信します。サーバーはIDトークンを検証し、問題がなければHTTP-OnlyのセッションCookieを生成してクライアントに返します。
5.  **認証状態の維持:** 以降、クライアントから管理者ページへのアクセス時には、リクエストにセッションCookieが自動的に添付されます。サーバーサイドのミドルウェアがこのCookieを検証し、アクセスを許可または拒否します。

### 設定手順

#### 1. Identity Platform の有効化とプロバイダ設定

1.  [Google Cloudコンソール](https://console.cloud.google.com/)で、対象のプロジェクトを選択します。
2.  ナビゲーションメニューから `セキュリティ` > `Identity Platform` を選択します。まだ有効になっていない場合は、`Identity Platform を有効にする`をクリックします。
3.  `ID プロバイダ` タブに移動し、`プロバイダを追加` をクリックします。
4.  プロバイダのリストから `Google` を選択し、`有効` スイッチをオンにして保存します。
5.  `設定` タブに移動し、`承認済みドメイン` にアプリケーションをデプロイするドメインを追加します (例: `your-domain.com`)。ローカルでのテスト用に `localhost` も追加しておくと便利です。

#### 2. Firebase Web アプリの設定情報取得

クライアントサイドで利用するFirebase SDKの設定情報を取得します。

1.  [Firebaseコンソール](https://console.firebase.google.com/)にアクセスし、ご自身のGoogle Cloudプロジェクトを選択します。（Identity Platformを有効にすると、Firebase上にもプロジェクトが紐づけられます）。
2.  プロジェクトの概要ページから `</>` (ウェブ) アイコンをクリックして、ウェブアプリを登録します。
3.  アプリの登録後、`firebaseConfig` オブジェクトが表示されます。このオブジェクトの内容を、次のステップで利用するため安全な場所に控えておきます。

    ```javascript
    // この値は後で環境変数として利用します
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "...",
      appId: "1:...:web:...",
    };
    ```

#### 3. 環境変数の設定

取得した設定値は、環境に応じて適切な方法で環境変数として設定します。

##### ローカル開発環境

Next.jsアプリケーションのルートディレクトリに `.env.local` ファイルを作成（または追記）します。このファイルは `.gitignore` に含まれており、Gitリポジトリにはコミットされないため安全です。

```.env.local
# Firebase Client SDK Config
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:...:web:..."
```

##### 本番環境 (Cloud Run)

本番環境では、`.env.local` ファイルは使用しません。代わりに、CDパイプライン（GitHub Actions）がデプロイ時にGitHub Secretsの値を参照し、Cloud Runサービスの環境変数として自動で設定します。設定すべき値については「CDパイプラインの設定」のセクションを参照してください。

## 既知の問題 (Known Issues)

### `npm install`時の警告

開発環境のセットアップ (`npm install`) やCIの実行時に、以下の様な古いパッケージに関する警告が表示されることがあります。

```
npm warn deprecated inflight@1.0.6: This module is not supported...
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```

これは、テストツール(`Jest`)の依存関係の奥深くで、古いバージョンのパッケージが利用されているために発生します。

これらの警告を強制的に解消しようとすると、テストのコードカバレッジ機能が動作しなくなるという副作用が発生するため、現状では警告を許容しています。アプリケーションの動作やセキュリティに直接的な影響はありません。