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

## CI/CD パイプライン

このプロジェクトでは、GitHub Actionsを使用してCI/CDパイプラインを分離・実行しています。

### CI (継続的インテグレーション)

- **目的:** `main`ブランチにマージされる前のコード品質を保証します。
- **トリガー:** `main`ブランチをターゲットとした`pull_request`作成・更新時。実行は`apps/web/`配下、または関連するワークフローファイルに変更があった場合に限定されます。
- **実行内容:**
    - ESLintによるコード静的解析 (`npm run lint`)
    - Jestによる単体テスト (`npm run test`)

### CD (継続的デリバリー)

- **目的:** `main`ブランチの最新のコードをコンテナイメージとしてビルドし、Google Artifact Registryに登録します。
- **トリガー:** `main`ブランチへの`push`時（Pull Requestのマージなど）。実行は`apps/web/`配下、または関連するワークフローファイルに変更があった場合に限定されます。

#### CDパイプラインの設定

CDパイプラインを有効にするには、事前にGitHubリポジトリに以下のシークレットを設定する必要があります。

##### 設定手順

1.  対象のGitHubリポジトリで、`Settings` > `Secrets and variables` > `Actions` に移動します。
2.  `New repository secret`ボタンを押し、以下のシークレットを一つずつ登録します。

##### 必要なシークレット

| シークレット名                      | 説明                                                                                                                                                           | 設定例                                                                              |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`                    | Google CloudプロジェクトのID。                                                                                                                                 | `my-gcp-project-12345`                                                              |
| `GCP_REGION`                        | リソースをデプロイするGCPリージョン。                                                                                                                          | `asia-northeast1`                                                                   |
| `GCP_SERVICE_ACCOUNT`               | GitHub ActionsからGCPへの認証に使用するサービスアカウントのメールアドレス。このサービスアカウントには`Artifact Registry Writer`のロールが必要です。 | `github-actions-runner@my-gcp-project-12345.iam.gserviceaccount.com`                |
| `GCP_WORKLOAD_IDENTITY_PROVIDER`    | GCPのWorkload Identity連携で設定したプロバイダー名。                                                                                                           | `projects/1234567890/locations/global/workloadIdentityPools/my-pool/providers/my-provider` |
| `GCS_BUCKET_NAME`                   | (デプロイ時に使用) アプリケーションが使用するGoogle Cloud Storageのバケット名。                                                                                | `my-app-storage-bucket`                                                             |
| `ADMIN_EMAIL_LIST`                  | (デプロイ時に使用) アプリケーションの管理者として許可するGoogleアカウントのメールアドレス（カンマ区切り）。                                                      | `admin1@example.com,admin2@example.com`                                             |

これらのシークレットを設定することで、GitHub Actionsは安全にGCPへ認証し、コンテナイメージのプッシュやデプロイを実行できるようになります。

## 既知の問題 (Known Issues)

### `npm install`時の警告

開発環境のセットアップ (`npm install`) やCIの実行時に、以下の様な古いパッケージに関する警告が表示されることがあります。

```
npm warn deprecated inflight@1.0.6: This module is not supported...
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```

これは、テストツール(`Jest`)の依存関係の奥深くで、古いバージョンのパッケージが利用されているために発生します。

これらの警告を強制的に解消しようとすると、テストのコードカバレッジ機能が動作しなくなるという副作用が発生するため、現状では警告を許容しています。アプリケーションの動作やセキュリティに直接的な影響はありません。