import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/header';
import { expect, test, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import { TooltipProvider } from '@radix-ui/react-tooltip';

test('renders header component', () => {
  const mockOnLogout = vi.fn();
  render(
    <Router>
      <TooltipProvider>
        <Header onLogout={mockOnLogout} />
      </TooltipProvider>
    </Router>
  );

  const heading = screen.getByText(/News Article Collector/i);
  expect(heading).toBeInTheDocument();

  const githubLink = screen.getByRole('link', { name: /GitHub repository/i });
  expect(githubLink).toBeInTheDocument();
  expect(githubLink).toHaveAttribute('href', 'https://github.com/uh-dcm/news-article-collection-container');
});
