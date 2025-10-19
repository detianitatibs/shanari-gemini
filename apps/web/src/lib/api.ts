
import { URLSearchParams } from 'url';


// APIからデータを取得する関数
export async function fetchPosts(query: URLSearchParams) {
  // TODO: エラーハンドリング
  const res = await fetch(`http://localhost:3000/api/posts?${query.toString()}`);
  const data = await res.json();
  return data.posts;
}

export async function fetchCategories() {
  const res = await fetch(`http://localhost:3000/api/categories`);
  const data = await res.json();
  return data.categories;
}

export async function fetchArchives() {
  const res = await fetch(`http://localhost:3000/api/archives`);
  const data = await res.json();
  return data.archives;
}
