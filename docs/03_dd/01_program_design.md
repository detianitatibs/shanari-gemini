# プログラム設計書

## 1. モジュール構成図

本システムはNext.jsのApp Routerをベースに構築する。ディレクトリ構成は以下の通り。

```
/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (admin)/
│       │   │   │   ├── admin/
│       │   │   │   │   ├── dashboard/
│       │   │   │   │   │   └── page.tsx      # 管理者ダッシュボード
│       │   │   │   │   ├── posts/
│       │   │   │   │   │   ├── page.tsx      # 記事一覧
│       │   │   │   │   │   ├── new/
│       │   │   │   │   │   │   └── page.tsx  # 記事新規作成
│       │   │   │   │   │   └── [id]/
│       │   │   │   │   │       └── edit/
│       │   │   │   │   │           └── page.tsx # 記事編集
│       │   │   │   │   └── layout.tsx          # 管理画面共通レイアウト
│       │   │   │   └── login/
│       │   │   │       └── page.tsx          # ログイン画面
│       │   │   ├── (main)/
│       │   │   │   ├── blog/
│       │   │   │   │   ├── page.tsx          # ブログ一覧
│       │   │   │   │   └── [slug]/
│       │   │   │   │       └── page.tsx      # ブログ詳細
│       │   │   │   ├── profile/
│       │   │   │   │   └── page.tsx          # プロフィール
│       │   │   │   └── layout.tsx            # 一般画面共通レイアウト
│       │   │   ├── api/
│       │   │   │   ├── admin/
│       │   │   │   │   ├── posts/
│       │   │   │   │   │   ├── route.ts      # [POST] 記事作成
│       │   │   │   │   │   └── [id]/
│       │   │   │   │   │       └── route.ts  # [PUT, DELETE] 記事更新/削除
│       │   │   │   │   └── image-upload/
│       │   │   │   │       └── route.ts      # [POST] 画像アップロード
│       │   │   │   ├── posts/
│       │   │   │   │   ├── route.ts          # [GET] 記事一覧取得
│       │   │   │   │   └── [slug]/
│       │   │   │   │       └── route.ts      # [GET] 記事詳細取得
│       │   │   │   ├── categories/
│       │   │   │   │   └── route.ts          # [GET] カテゴリ一覧取得
│       │   │   │   └── archives/
│       │   │   │       └── route.ts          # [GET] アーカイブ一覧取得
│       │   │   └── page.tsx                  # トップページ
│       │   ├── components/
│       │   │   ├── atoms/                # Button, Inputなど
│       │   │   ├── molecules/            # PostCard, SearchFormなど
│       │   │   └── organisms/            # Header, Sidebarなど
│       │   ├── lib/
│       │   │   ├── db/                   # TypeORMのコネクション、Entity定義
│       │   │   ├── gcs/                  # Google Cloud Storage関連処理
│       │   │   └── auth/                 # 認証関連処理
│       │   └── middleware.ts             # 認証チェックなど
│       ├── public/
│       ├── package.json
│       └── ...
```

## 2. I/Oインターフェース定義

主要なAPIエンドポイントで利用するデータ構造をTypeScriptのインターフェースとして定義する。

### 2.1. `GET /api/posts` (記事一覧)

#### レスポンスボディ

```typescript
interface PostItem {
  slug: string;
  title: string;
  published_at: string; // ISO 8601 format
  categories: {
    id: number;
    name:string;
  }[];
}

interface Pagination {
  total: number;
  page: number;
  perPage: number;
}

interface GetPostsResponse {
  posts: PostItem[];
  pagination: Pagination;
}
```

### 2.2. `POST /api/admin/posts` (記事作成)

#### リクエストボディ

```typescript
interface CreatePostRequest {
  title: string;
  content: string; // Markdown本文
  categories: string[]; // カテゴリ名の配列
  status: 'published' | 'draft';
  published_at?: string; // ISO 8601 format
}
```

#### レスポンスボディ

```typescript
interface CreatePostResponse {
  id: number;
  message: string;
}
```

### 2.3. `PUT /api/admin/posts/:id` (記事更新)

#### リクエストボディ

```typescript
interface UpdatePostRequest {
  title: string;
  content: string; // Markdown本文
  categories: string[];
  status: 'published' | 'draft';
  published_at?: string; // ISO 8601 format
}
```

## 3. 処理フロー/アルゴリズム

### 3.1. 記事作成・更新処理

対象モジュール: `POST /api/admin/posts`, `PUT /api/admin/posts/:id`

```pseudocode
function handlePostRequest(request):
  // 1. 管理者認証チェック
  user = authenticateAdmin(request.headers.authorization)
  if not user:
    return 401 Unauthorized

  // 2. リクエストボディをパース
  body = parseJson(request.body)

  // 3. バリデーション
  errors = validate(body, ['title', 'content', 'status'])
  if errors:
    return 400 Bad Request with errors

  // 4. Front Matterと本文を結合してMarkdownファイルコンテンツを作成
  frontMatter = generateFrontMatter(body)
  markdownContent = frontMatter + "\n---" + body.content

  // 5. slugを生成 (新規作成時のみ)
  // 例: 20251006_daily_1
  slug = (isCreating) ? generateSlug(body.categories[0]) : getExistingSlug(postId)

  // 6. ファイルパスを生成し、Google Cloud Storageにアップロード
  yearMonth = format(now(), "YYYY/MM")
  filePath = "posts/" + yearMonth + "/" + slug + ".md"
  uploadToGCS(filePath, markdownContent)

  // 7. データベースにメタデータを保存
  db = connectDatabase()
  transaction:
    // 7-1. カテゴリを取得または作成
    categoryIds = []
    for categoryName in body.categories:
      category = db.categories.findOrCreate({ name: categoryName })
      categoryIds.add(category.id)

    // 7-2. 記事データを保存 (作成 or 更新)
    postData = {
      title: body.title,
      status: body.status,
      published_at: body.published_at,
      file_path: filePath,
      author_id: user.id,
      slug: slug
    }
    if isCreating:
      post = db.posts.create(postData)
    else:
      post = db.posts.update(postId, postData)

    // 7-3. 中間テーブルを更新
    db.post_categories.delete({ post_id: post.id })
    for categoryId in categoryIds:
      db.post_categories.create({ post_id: post.id, category_id: categoryId })

  // 8. レスポンスを返す
  return 200 OK with { id: post.id, message: "Success" }
```

### 3.2. 画像アップロード処理

対象モジュール: `POST /api/admin/image-upload`

```pseudocode
function handleImageUpload(request):
  // 1. 管理者認証チェック
  user = authenticateAdmin(request.headers.authorization)
  if not user:
    return 401 Unauthorized

  // 2. リクエストから画像ファイルを取得
  imageFile = request.files['image']
  if not imageFile:
    return 400 Bad Request

  // 3. ファイル名を生成 (例: 20251006_abcdef123456.jpg)
  timestamp = format(now(), "YYYYMMDD")
  randomString = generateRandomString(12)
  fileName = timestamp + "_" + randomString + "." + imageFile.extension

  // 4. ファイルパスを生成し、画像をGoogle Cloud Storageにアップロード
  yearMonth = format(now(), "YYYY/MM")
  filePath = "images/" + yearMonth + "/" + fileName
  uploadToGCS(filePath, imageFile.binaryData)

  // 5. アップロードした画像のURLを返す
  imageUrl = getGCSFileUrl(filePath)
  return 200 OK with { url: imageUrl }
```

## 4. Markdownレンダリング仕様

### 4.1. 使用ライブラリ

- **Markdown変換:** `react-markdown`
- **HTML要素の許可:** `rehype-raw` (`react-markdown`のプラグイン)
- **シンタックスハイライト:** `react-syntax-highlighter`

### 4.2. 実装方針

ブログ詳細ページおよび管理者ページのプレビューでは、`react-markdown`コンポーネントを用いてMarkdown文字列をReactコンポーネントに変換する。
YouTubeの埋め込み`<iframe>`を許可するため、`rehype-raw`プラグインを導入する。

#### 4.2.1. コンポーネント実装例

`components/organisms/MarkdownRenderer.tsx` (新規作成)

```typescript
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]} // iframeなどのHTMLタグを許可
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
```

#### 4.2.2. `rehype-raw` の設定

`rehype-raw`はデフォルトで危険な可能性のあるコンテンツ（例: `<script>`タグ）をサニタイズする。
`<iframe>`タグは、YouTubeなどの信頼できるソースからの埋め込みを許可するために、デフォルトで有効な要素として扱われる。特別な設定は不要。
これにより、セキュリティを確保しつつ、要件である動画埋め込み機能を実現する。

## 5. テスト戦略

### 5.1. テスト環境

本プロジェクトでは、Jest を用いたテストを実装する。テスト対象に応じて、以下の2つの実行環境を使い分ける。

#### 5.1.1. フロントエンド (Reactコンポーネント)

- **環境:** `jsdom`
- **設定:** `jest.config.js` でデフォルトの `testEnvironment` を `jest-environment-jsdom` に設定する。
- **理由:** Reactコンポーネントのテストでは、DOMのレンダリングやイベントの発火をシミュレートする必要があるため、`jsdom` 環境が必須となる。

#### 5.1.2. バックエンド (API Routes)

- **環境:** `node`
- **設定:** APIのテストファイル（例: `*.test.ts`）の先頭に、以下のdocblockコメントを記述することで、そのファイルのみテスト環境を `node` に切り替える。
- **理由:** APIのテストはDOMに依存せず、Node.jsのランタイムで実行されるため、`node` 環境の方が軽量かつ、`fetch` APIなどの互換性の問題が発生しにくい。

```javascript
/**
 * @jest-environment node
 */

// ...テストコード本体
```
