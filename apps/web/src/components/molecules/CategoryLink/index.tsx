
import Link from 'next/link';
import { FC } from 'react';

type CategoryLinkProps = {
  name: string;
  count: number;
};

const CategoryLink: FC<CategoryLinkProps> = ({ name, count }) => {
  return (
    <Link
      href={`/blog/category/${encodeURIComponent(name.toLowerCase())}`}
      className="flex justify-between items-center p-2 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
    >
      <span>{name}</span>
      <span className="text-sm text-zinc-500">{count}</span>
    </Link>
  );
};

export default CategoryLink;
