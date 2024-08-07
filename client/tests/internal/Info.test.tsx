import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Info from '@/features/info/Info';
import { expect, test } from 'vitest';

test('renders QuestionsAccordion component and toggles content', () => {
  render(<Info />);

  const heading = screen.getByText(/How does the collector work?/i);
  expect(heading).toBeInTheDocument();

  let content = screen.queryByText(/The news feed article collector automatically gathers articles/i);
  expect(content).not.toBeInTheDocument();

  fireEvent.click(heading);

  content = screen.getByText(/The news feed article collector automatically gathers articles/i);
  expect(content).toBeInTheDocument();
});
