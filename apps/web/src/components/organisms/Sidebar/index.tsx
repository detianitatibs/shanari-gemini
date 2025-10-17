
'use client';

import { FC, useState } from 'react';
import CategoryLink from '@/components/molecules/CategoryLink';
import ArchiveLink from '@/components/molecules/ArchiveLink';
import Icon from '@/components/atoms/Icon';

type Category = {
  name: string;
  count: number;
};

type Archive = {
  year: number;
  month: number;
  count: number;
};

type SidebarProps = {
  categories: Category[];
  archives: Archive[];
};

const Sidebar: FC<SidebarProps> = ({ categories, archives }) => {
  const [openYears, setOpenYears] = useState<Record<number, boolean>>({});

  const toggleYear = (year: number) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const archivesByYear = archives.reduce<Record<number, Archive[]>>((acc, archive) => {
    if (!acc[archive.year]) {
      acc[archive.year] = [];
    }
    acc[archive.year].push(archive);
    return acc;
  }, {});

  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <CategoryLink key={category.name} {...category} />
          ))}
        </div>
      </div>

      <div className="p-4 mt-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Archives</h3>
        <div className="space-y-2">
          {Object.entries(archivesByYear)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, yearArchives]) => (
              <div key={year}>
                <button
                  onClick={() => toggleYear(Number(year))}
                  className="w-full flex justify-between items-center font-bold text-md p-2 hover:bg-zinc-100 rounded-md"
                >
                  <span>{year}年</span>
                  <Icon name={openYears[Number(year)] ? 'ChevronUpIcon' : 'ChevronDownIcon'} className="h-5 w-5" />
                </button>
                {openYears[Number(year)] && (
                  <div className="pl-4 mt-1 space-y-1">
                    {yearArchives
                      .sort((a, b) => b.month - a.month)
                      .map(archive => (
                        <ArchiveLink key={`${archive.year}-${archive.month}`} {...archive} />
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
