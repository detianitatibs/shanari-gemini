
import { FC } from 'react';
import PostCard from '@/components/molecules/PostCard';

type Category = {
  id: number;
  name: string;
};

type Post = {
  slug: string;
  title: string;
  published_at: string;
  categories: Category[];
  thumbnail_url?: string;
};

type PostListProps = {
  posts: Post[];
};

const PostList: FC<PostListProps> = ({ posts }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <PostCard key={post.slug} {...post} />
      ))}
    </div>
  );
};

export default PostList;
