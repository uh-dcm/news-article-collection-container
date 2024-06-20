import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable } from '@/components/ui/data-table';
import { articleColumns, Article } from '@/components/ui/article-columns';
import { expect, test } from 'vitest';

const testData: Article[] = [
  {
    time: "2016-06-06 09:09:09",
    url: 'https://blabla.com/1',
    full_text: 'Miau mau miu mau miau mau.',
  },
  {
    time: "2016-06-06 09:09:09",
    url: 'https://blabla.com/2',
    full_text: 'Hauki on kala hauki on kala hauki on kala.',
  },
];

test('renders DataTable component with articles', () => {
  render(<DataTable columns={articleColumns} data={testData} />);

  const firstArticleUrl = screen.getByText('https://blabla.com/1');
  const secondArticleUrl = screen.getByText('https://blabla.com/2');
  
  const firstArticleText = screen.getByText('Miau mau miu mau miau mau.');
  const secondArticleText = screen.getByText('Hauki on kala hauki on kala hauki on kala.');

  expect(firstArticleUrl).toBeInTheDocument();
  expect(secondArticleUrl).toBeInTheDocument();
  
  expect(firstArticleText).toBeInTheDocument();
  expect(secondArticleText).toBeInTheDocument();
});
