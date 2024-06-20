import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/header';
import { expect, test } from 'vitest';

test('renders header component', () => {
  render(<Header />);

  const heading = screen.getByText(/News article collector/i);
  expect(heading).toBeInTheDocument();

  const githubLink = screen.getByRole('link', { name: /GitHub repository/i });
  expect(githubLink).toBeInTheDocument();
  expect(githubLink).toHaveAttribute('href', 'https://github.com/uh-dcm/news-article-collection-container');
});