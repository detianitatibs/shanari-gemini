'use client';

import { FC } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const SortDropdown: FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sort', e.target.value);
    router.push(`?${newParams.toString()}`);
  };

  return (
    <select
      onChange={handleSortChange}
      defaultValue={searchParams.get('sort') || 'new'}
      className="border border-zinc-300 rounded-md p-2"
    >
      <option value="new">新しい順</option>
      <option value="old">古い順</option>
    </select>
  );
};

export default SortDropdown;
