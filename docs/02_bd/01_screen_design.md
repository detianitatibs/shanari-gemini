# 画面設計書

## 1. 画面レイアウト（ワイヤーフレーム）

MarkdownとMermaidを用いて各ページの主要なレイアウトを定義する。

### 1.1. トップページ

```mermaid
graph TD
    subgraph Header
        Logo --> Home
        Nav[Nav: Blog, Profile]
    end
    subgraph Main
        Title[Welcome to My Site]
        subgraph ContentsGrid
            Tile1[Blog] --> BlogPage
            Tile2["Photos (Future)"]
            Tile3[...]
        end
    end
    subgraph Footer
        Copyright
    end
    Header --> Main --> Footer
```

### 1.2. ブログ一覧ページ

```mermaid
graph TD
    subgraph Header
        ...
    end
    subgraph Main
        direction LR
        subgraph Contents
            PageTitle[Blog]
            Sort[Sort Dropdown]
            PostList["Post 1<br/>Post 2<br/>Post 3<br/>--- Ad ---<br/>Post 4<br/>..."]
            Pagination
        end
        subgraph Sidebar
            CategoryFilter[Category Filter]
            ArchiveFilter[Archive by Month]
        end
        Contents -- reads from --> Sidebar
    end
    subgraph Footer
        ...
    end
    Header --> Main --> Footer
```

### 1.3. ブログ詳細ページ

```mermaid
graph TD
    subgraph Header
        ...
    end
    subgraph Main
        direction LR
        subgraph Contents
            Title[Article Title]
            Ad1[Adsense Block]
            Body[Article Body]
        end
        subgraph Sidebar
            CategoryFilter[Category Filter]
            ArchiveFilter[Archive by Month]
            Ad2[Adsense Block]
        end
    end
    subgraph Footer
        ...
    end
    Header --> Main --> Footer
```

### 1.4. 管理者ページ

#### 1.4.1. ダッシュボード

```mermaid
graph TD
    subgraph Header
        AdminTitle[Admin Dashboard]
    end
    subgraph Main
        subgraph ContentsGrid
            Card1[Blog Management] --> /admin/posts
            Card2["Photo Management (Future)"]
            Card3[...]
        end
    end
    Header --> Main
```

#### 1.4.2. 記事一覧

```mermaid
graph TD
    subgraph Header
        AdminTitle[Blog Management]
    end
    subgraph Main
        NewPostButton["New Post Button"] --> /admin/posts/new
        subgraph PostTable
            HeaderRow["Title | Status | Last Updated | Actions"]
            Row1["Post 1 | Published | 2025-10-05 | Edit / Delete"]
            Row2["Post 2 | Draft | 2025-10-04 | Edit / Delete"]
        end
    end
    Header --> Main
```

#### 1.4.3. 記事編集

```mermaid
graph TD
    subgraph Header
        AdminTitle[Edit Post]
    end
    subgraph Main
        direction LR
        subgraph Editor
            TitleInput[Title Input]
            MarkdownEditor[Markdown Editor]
        end
        subgraph Preview
            LivePreview[Live Preview]
        end
        Editor -- renders --> Preview
    end
    subgraph Actions
        SaveButton[Save Button]
        StatusToggle[Status Toggle]
        DeleteButton[Delete Button]
    end
    Header --> Main --> Actions
```
- **新規作成時:** エディタにはデフォルトのテンプレートが表示される。
- **プレビュー:** Markdownのプレビューエリアでは、Front Matter部分はテーブル形式などで整形して表示し、本文のみをレンダリングする。これにより、メタデータと本文のプレビューを明確に分離する。

## 2. 画面デザイン

- **カラー構成:**
  - **メイン:** `zinc-200` (背景など)
  - **サブ:** `yellow-300` (アクセント、ホバーエフェクトなど)
  - **アクセント:** `indigo-400` (ボタン、リンクなど)
  - **テキスト:** `zinc-800` (基本テキスト), `white` (ボタンテキストなど)
- **フォント:**
  - **基本:** `Noto Sans JP` (システムフォールバック: `sans-serif`)
  - **コード:** `Roboto Mono` (システムフォールバック: `monospace`)
- **アイコン:** `Material Icons` または `Heroicons` を利用。

## 3. 画面遷移図

```mermaid
graph TD
    A["/"] -- "Click Blog Tile" --> B["/blog"];
    A -- "Click Profile Icon" --> C["/profile"];
    B -- "Click Post" --> D["/blog/:slug"];
    D -- "Click Category" --> B;
    C -- "Click X Logo" --> E["https://x.com/..."];

    subgraph Admin Flow
        F["Direct Access /admin"] --> G{Authenticated?};
        G -- No --> H[Redirect to Google Login];
        H -- Success --> F;
        G -- Yes --> I["/admin/dashboard"];
        I -- "Click Blog Management" --> J["/admin/posts"];
        J -- "Click New Post" --> K["/admin/posts/new"];
        J -- "Click Edit" --> L["/admin/posts/:id/edit"];
        J -- "Click Delete" --> M(Delete Action);
    end
```

## 4. UI要素定義 (Atomic Design)

### 4.1. Atoms (原子)
- **Button:**
  - `PrimaryButton`: アクセントカラー(`indigo-400`)背景。ホバー時にサブカラー(`yellow-300`)のボーダーを表示。
  - `SecondaryButton`: ボーダーのみ。ホバー時に背景色が変わる。
- **Text:** `h1`, `h2`, `h3`, `p`, `a` などの基本的なテキスト要素。
- **Input:** テキスト入力、テキストエリア、チェックボックス。
- **Icon:** 各種アイコン。
- **Logo:** サイトロゴ。
- **AdsenseBlock:** Google AdSense広告を表示するコンポーネント。

### 4.2. Molecules (分子)
- **PostCard:** (ブログ一覧用) サムネイル画像、タイトル、公開日、カテゴリタグを含むカード。
- **SearchForm:** `Input` と `Button` を組み合わせた検索フォーム。
- **CategoryLink:** カテゴリ名のリンク。クリックでフィルタリング。
- **ArchiveLink:** 年月ごとのアーカイブリンク。

### 4.3. Organisms (有機体)
- **Header:** `Logo`, `Nav`, `Profile Icon` を含むサイトヘッダー。
- **PostList:** `PostCard` を複数表示するリスト。
- **Sidebar:** `CategoryFilter` と `ArchiveFilter` を含むサイドバー。
- **MarkdownEditorWithPreview:** 管理者ページのMarkdownエディタとプレビューの組み合わせ。

### 4.4. Templates (テンプレート)
- **DefaultLayout:** `Header`と`Footer`を持つ基本的なページレイアウト。
- **BlogLayout:** `DefaultLayout`に`Sidebar`を追加したブログ用レイアウト。

### 4.5. Pages (ページ)
- **HomePage:** `DefaultLayout`にトップページのコンテンツを配置。
- **BlogIndexPage:** `BlogLayout`に`PostList`を配置。
- **AdminEditorPage:** 管理者用のエディタ画面。
