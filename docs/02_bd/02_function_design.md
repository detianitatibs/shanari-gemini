# 機能設計書

## 1. 機能詳細仕様

### 1.1. ブログ機能 (一般)

#### 1.1.1. 記事一覧表示
- **Input:** (任意)カテゴリID, (任意)年月, (任意)ソート順
- **Process:**
  1. 指定された条件（カテゴリ、年月）で公開中の記事(`published`ステータス)のメタデータをDBから検索。
  2. 指定されたソート順（デフォルトは公開日の降順）で並び替え。
  3. ページネーションを適用して、指定されたページの情報を取得。
- **Output:** 記事メタデータ一覧（タイトル, 公開日, カテゴリなど）、ページネーション情報。

#### 1.1.2. 記事詳細表示
- **Input:** 記事IDまたはslug
- **Process:**
  1. 指定されたID/slugで公開中の記事のメタデータをDBから検索。
  2. 記事が見つからない場合は404エラーを返す。
  3. メタデータ内の`file_path`を元に、Cloud StorageからMarkdownファイルを取得。
  4. Markdown形式の本文をHTMLに変換。その際、XSS攻撃を防ぐためにサニタイズ処理を行うが、YouTube埋め込みのために`<iframe>`タグは許可する。
- **Output:** 記事データ（HTML変換後の本文を含む）。

### 1.2. 管理者機能

#### 1.2.1. 認証
- **Input:** `/admin`へのアクセス
- **Process:**
  1. ユーザーが未認証の場合、Identity Platformの認証画面にリダイレクト。
  2. Googleアカウントで認証後、コールバックURL経由でアプリケーションに戻る。
  3. 認証情報(JWT)を検証し、セッションを確立。
  4. 認証ユーザーのメールアドレスが許可リストにない場合、403 Forbiddenエラーを返す。
- **Output:** 認証済み管理者セッション。 `/admin/dashboard`へリダイレクト。

#### 1.2.2. 記事一覧表示 (管理者用)
- **Input:** なし
- **Process:**
  1. 管理者認証を必須とする。
  2. すべての記事（下書き含む）のメタデータを更新日時の降順でDBから取得。
- **Output:** 全記事のメタデータリスト（ID, タイトル, ステータス, 更新日時）。

#### 1.2.3. 記事CRUD
- **Input:** (作成/更新時)タイトル, 本文(Markdown), カテゴリ, ステータスなどFront Matterに準ずるデータ。 (削除時)記事ID。
- **Process:**
  1. すべての操作で管理者認証を必須とする。
  2. (作成/更新) 入力値からFront Matterと本文を組み合わせたMarkdownファイルを生成。
  3. (作成時) `slug` を `YYYYMMDD_Category_Number` の形式で自動生成する。
  4. (作成/更新) 生成したファイルをCloud Storageにアップロードし、ファイルパスを取得。
  5. (作成/更新) DBに記事のメタデータ（タイトル、カテゴリ、ステータス、ファイルパス、slug等）を保存。
  6. (削除) DBからメタデータを削除し、Cloud StorageからMarkdownファイルを削除。
- **Output:** 成功メッセージ、またはエラーメッセージ。

##### 新規作成時テンプレート
管理者が新規記事を作成する際、エディタには以下のテンプレートがデフォルトで表示される。

```markdown
---
title: タイトル
description: 説明文
date: YYYY-MM-DD
image: "[サムネイル用の画像ファイルパス]"
math:
license: CC @detain_itatibs
slug: "" # 保存時に自動生成されます
hidden: false
draft: true # 新規作成時は下書き状態
categories:
  - daily # daily|game|hobby|sport|parenting から選択
tags:
  - タグ1
  - タグ2
---

ここから本文
```

#### 1.2.4. 画像アップロード
- **Input:** 画像ファイル
- **Process:**
  1. 管理者認証を必須とする。
  2. アップロードされたファイルをCloud Storageに保存。
- **Output:** 保存された画像のURL。

## 2. API一覧

Next.jsのAPI Routes機能を利用して以下のAPIエンドポイントを実装する。

| Method | エンドポイント | 説明 | 認証 |
| :--- | :--- | :--- | :--- |
| GET | `/api/posts` | 記事一覧を取得する (ページネーション、フィルタ、ソート対応) | 不要 |
| GET | `/api/posts/:slug` | 特定の記事を取得する | 不要 |
| GET | `/api/categories` | カテゴリ一覧を取得する | 不要 |
| GET | `/api/archives` | 記事の年月アーカイブ一覧を取得する | 不要 |
| GET | `/api/admin/posts` | 全記事一覧を取得する（下書き含む） | 要管理者 |
| POST | `/api/admin/posts` | 新しい記事を作成する | 要管理者 |
| PUT | `/api/admin/posts/:id` | 特定の記事を更新する | 要管理者 |
| DELETE | `/api/admin/posts/:id` | 特定の記事を削除する | 要管理者 |
| POST | `/api/admin/image-upload` | 画像をアップロードする | 要管理者 |

## 3. 入出力データ定義 (主要な API)

### 3.1. `GET /api/posts` レスポンス
```json
{
  "posts": [
    {
      "slug": "20251005_daily_01",
      "title": "ブログ始めました",
      "published_at": "2025-10-05T10:00:00Z",
      "categories": [{ "id": 1, "name": "雑談" }]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "perPage": 10
  }
}
```

### 3.2. `POST /api/admin/posts` リクエストボディ
```json
{
  "title": "新しい記事",
  "content": "# 見出し\n\n本文です。", // Markdownの本文
  "categories": ["daily"],
  "status": "published" // or "draft"
}
```

## 4. エラー/メッセージ一覧

| HTTP Status | エラーコード | メッセージ | 説明 |
| :--- | :--- | :--- | :--- |
| 400 | `BAD_REQUEST` | 不正なリクエストです。 | バリデーションエラーなど |
| 401 | `UNAUTHORIZED` | 認証が必要です。 | 未ログインで要認証APIにアクセス |
| 403 | `FORBIDDEN` | この操作を行う権限がありません。 | 一般ユーザーが管理者機能にアクセス |
| 404 | `NOT_FOUND` | リソースが見つかりません。 | 存在しない記事IDへのアクセスなど |
| 500 | `INTERNAL_SERVER_ERROR` | サーバー内部でエラーが発生しました。 | 予期せぬサーバーエラー |