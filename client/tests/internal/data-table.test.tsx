
import { render, screen, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable } from '@/components/ui/data-table';
import { articleColumns } from '@/components/ui/article-columns';
import {expect, test, afterEach } from 'vitest';
import {testData } from './setupTests.ts';

afterEach(() => {
  cleanup();
});

test('renders DataTable component with articles', () => {
  render(
    <DataTable columns={articleColumns} data={testData} tableName="test" />
  );

  const firstArticleUrl = screen.getByText('https://blabla.com/1');
  const secondArticleUrl = screen.getByText('https://blabla.com/2');

  const firstArticleText = screen.getByText('Full text 1.');
  const secondArticleText = screen.getByText('Full text 2.');

  expect(firstArticleUrl).toBeInTheDocument();
  expect(secondArticleUrl).toBeInTheDocument();

  expect(firstArticleText).toBeInTheDocument();
  expect(secondArticleText).toBeInTheDocument();
});