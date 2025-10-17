
import Link from 'next/link';
import { FC } from 'react';

type ArchiveLinkProps = {
  year: number;
  month: number;
  count: number;
};

const ArchiveLink: FC<ArchiveLinkProps> = ({ year, month, count }) => {
  const monthName = new Date(year, month - 1).toLocaleString('ja-JP', {
    month: 'long',
  });

  return (
    <Link
      href={`/blog/archive/${year}/${month}`}
      className="flex justify-between items-center p-2 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
    >
      <span>{`${year}年 ${monthName}`}</span>
      <span className="text-sm text-zinc-500">{count}</span>
    </Link>
  );
};

export default ArchiveLink;
