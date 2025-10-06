# データベース物理設計書

本設計書は、論理データモデルをSQLite3データベースで実装するための物理的な仕様を定義する。

## 1. テーブル物理定義書

### 1.1. `admin_users` (管理者ユーザー)

| 物理名 | データ型 | 制約 | デフォルト値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | | 管理者ID |
| `name` | `TEXT` | `NOT NULL` | | 表示名 |
| `email` | `TEXT` | `NOT NULL UNIQUE` | | Googleアカウントのメールアドレス |
| `google_uid` | `TEXT` | `NOT NULL UNIQUE` | | Identity Platformが発行するUID |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | レコード作成日時 |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | レコード更新日時 |

### 1.2. `posts` (ブログ記事)

| 物理名 | データ型 | 制約 | デフォルト値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | | 記事ID |
| `title` | `TEXT` | `NOT NULL` | | 記事のタイトル |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | | 記事のスラッグ |
| `file_path` | `TEXT` | `NOT NULL` | | Cloud Storage上のMarkdownファイルのパス |
| `status` | `TEXT` | `NOT NULL` | `'draft'` | `published` or `draft` |
| `published_at` | `DATETIME` | | `NULL` | 公開日時 |
| `author_id` | `INTEGER` | `NOT NULL, REFERENCES admin_users(id)` | | 記事の作成者 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | レコード作成日時 |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | レコード更新日時 |

### 1.3. `categories` (カテゴリ)

| 物理名 | データ型 | 制約 | デフォルト値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | | カテゴリID |
| `name` | `TEXT` | `NOT NULL UNIQUE` | | カテゴリの名前 |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | レコード作成日時 |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | レコード更新日時 |

### 1.4. `post_categories` (記事-カテゴリ中間テーブル)

| 物理名 | データ型 | 制約 | デフォルト値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `post_id` | `INTEGER` | `NOT NULL, REFERENCES posts(id) ON DELETE CASCADE` | | 記事ID |
| `category_id` | `INTEGER` | `NOT NULL, REFERENCES categories(id) ON DELETE CASCADE` | | カテゴリID |

**複合主キー:** `(post_id, category_id)`

## 2. インデックス定義

パフォーマンス向上のため、以下のカラムにインデックスを設定する。
主キーには自動的にインデックスが付与される。

| テーブル名 | インデックス名 | 対象カラム |
| :--- | :--- | :--- |
| `posts` | `idx_posts_author_id` | `author_id` |
| `posts` | `idx_posts_status_published_at` | `status`, `published_at` |
| `post_categories` | `idx_post_categories_post_id` | `post_id` |
| `post_categories` | `idx_post_categories_category_id` | `category_id` |

## 3. ストレージ/パーティション設計

本システムではデータベースとしてSQLite3を採用する。データは単一のファイルとして管理される。
想定されるデータ規模では、テーブルのパーティショニングや特殊なストレージ設計は不要と判断する。

## 4. CRUD定義

各テーブルに対するCRUD（作成、読み取り、更新、削除）操作を行う主要なモジュール（APIエンドポイント）を以下に示す。

| テーブル | Create | Read | Update | Delete |
| :--- | :--- | :--- | :--- | :--- |
| `admin_users` | - | `/api/admin/*` (認証時) | - | - |
| `posts` | `/api/admin/posts` | `/api/posts`, `/api/posts/:slug` | `/api/admin/posts/:id` | `/api/admin/posts/:id` |
| `categories` | `/api/admin/posts` (記事作成/更新時) | `/api/categories` | - | - |
| `post_categories` | `/api/admin/posts` | `/api/posts`, `/api/posts/:slug` | `/api/admin/posts/:id` | `/api/admin/posts/:id` |
