
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

// New test cases:
// Test for the DataTable component (e.g., empty data, different column configurations).
// Test for missing columns or data.

test('renders DataTable component with empty data', () => {
  render(
    <DataTable columns={articleColumns} data={[]} tableName="test" />
  );

  const noDataMessage = screen.getByText('No data available');

  expect(noDataMessage).toBeInTheDocument();
});

test('renders DataTable component with different columns', () => {
  const customColumns = [
    { Header: 'Custom Column', accessor: 'custom' },
  ];
  const customData = [
    { custom: 'Custom Data 1' },
    { custom: 'Custom Data 2' },
  ];

  render(
    <DataTable columns={customColumns} data={customData} tableName="custom" />
  );

  const firstCustomData = screen.getByText('Custom Data 1');
  const secondCustomData = screen.getByText('Custom Data 2');

  expect(firstCustomData).toBeInTheDocument();
  expect(secondCustomData).toBeInTheDocument();
});

test('renders DataTable component with missing columns', () => {
  const incompleteData = [
    { time: '2016-06-06 09:09:09', url: 'https://blabla.com/1' },
    { time: '2016-06-06 09:09:09', url: 'https://blabla.com/2' },
  ];

  render(
    <DataTable columns={articleColumns} data={incompleteData} tableName="test" />
  );

  const firstArticleUrl = screen.getByText('https://blabla.com/1');
  const secondArticleUrl = screen.getByText('https://blabla.com/2');

  expect(firstArticleUrl).toBeInTheDocument();
  expect(secondArticleUrl).toBeInTheDocument();
});

test('renders DataTable component with empty column configuration', () => {
  render(
    <DataTable columns={[]} data={testData} tableName="test" />
  );

  const noColumnsMessage = screen.getByText('No columns available');

  expect(noColumnsMessage).toBeInTheDocument();
});