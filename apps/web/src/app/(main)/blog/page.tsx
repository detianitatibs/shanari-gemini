
import { Suspense } from 'react';
import PostList from '@/components/organisms/PostList';
import Sidebar from '@/components/organisms/Sidebar';
import SortDropdown from '@/components/molecules/SortDropdown';

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const BlogPage = async ({ searchParams }: PageProps) => {
  // searchParamsからクエリ文字列を安全に構築
  const postQuery = new URLSearchParams();
  if (searchParams.category) postQuery.set('category', String(searchParams.category));
  if (searchParams.archive) postQuery.set('archive', String(searchParams.archive));
  if (searchParams.sort) postQuery.set('sort', String(searchParams.sort));
  if (searchParams.page) postQuery.set('page', String(searchParams.page));

  // データ取得を並列化
  const postsPromise = fetch(`/api/posts?${postQuery.toString()}`).then(res => res.json());
  const categoriesPromise = fetch(`/api/categories`).then(res => res.json());
  const archivesPromise = fetch(`/api/archives`).then(res => res.json());

  const [postsData, categoriesData, archivesData] = await Promise.all([
    postsPromise,
    categoriesPromise,
    archivesPromise,
  ]);

  const posts = postsData.posts || [];
  const categories = categoriesData.categories || [];
  const archives = archivesData.archives || [];

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="w-full lg:w-2/3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Blog</h1>
          <SortDropdown />
        </div>
        <Suspense fallback={<div>Loading posts...</div>}>
          <PostList posts={posts} />
          {/* TODO: Pagination */}
        </Suspense>
      </div>
      <div className="w-full lg:w-1/3">
        <Suspense fallback={<div>Loading sidebar...</div>}>
          <Sidebar categories={categories} archives={archives} />
        </Suspense>
      </div>
    </div>
  );
};

export default BlogPage;
