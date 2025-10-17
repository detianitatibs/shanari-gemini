
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from './index';

describe('SearchForm', () => {
  it('calls onSearch with the query when the user presses Enter', async () => {
    const handleSearch = jest.fn();
    render(<SearchForm onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('Search posts...');
    await userEvent.type(input, 'hello world{enter}');

    expect(handleSearch).toHaveBeenCalledWith('hello world');
  });

  it('updates the input value as the user types', async () => {
    render(<SearchForm onSearch={() => {}} />);
    const input = screen.getByPlaceholderText('Search posts...') as HTMLInputElement;
    await userEvent.type(input, 'testing');
    expect(input.value).toBe('testing');
  });
});
