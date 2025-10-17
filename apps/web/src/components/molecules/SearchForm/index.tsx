
'use client';

import { FC, useState, FormEvent } from 'react';
import Input from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';

type SearchFormProps = {
  onSearch: (query: string) => void;
};

const SearchForm: FC<SearchFormProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <Input
        type="search"
        placeholder="Search posts..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pl-10"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon name="SearchIcon" className="h-5 w-5 text-zinc-400" />
      </div>
    </form>
  );
};

export default SearchForm;
