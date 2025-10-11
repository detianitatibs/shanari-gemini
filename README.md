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

## CI/CD

このプロジェクトでは、GitHub Actionsを使用したCI（継続的インテグレーション）パイプラインが設定されています。

- **トリガー:** `main`ブランチへの`push`、または任意のブランチへの`pull_request`
- **実行内容:**
    - ESLintによるコード静的解析 (`npm run lint`)
    - Jestによる単体テスト (`npm run test`)

Pull Requestを作成すると、これらのチェックが自動的に実行され、コードの品質を担保します。

## 既知の問題 (Known Issues)

### `npm install`時の警告

開発環境のセットアップ (`npm install`) やCIの実行時に、以下の様な古いパッケージに関する警告が表示されることがあります。

```
npm warn deprecated inflight@1.0.6: This module is not supported...
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```

これは、テストツール(`Jest`)の依存関係の奥深くで、古いバージョンのパッケージが利用されているために発生します。

これらの警告を強制的に解消しようとすると、テストのコードカバレッジ機能が動作しなくなるという副作用が発生するため、現状では警告を許容しています。アプリケーションの動作やセキュリティに直接的な影響はありません。