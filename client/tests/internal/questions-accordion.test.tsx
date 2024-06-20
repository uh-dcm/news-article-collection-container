import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestionsAccordion from '@/components/questions-accordion';
import { expect, test } from 'vitest';

test('renders QuestionsAccordion component and toggles content', () => {
  render(<QuestionsAccordion />);

  const heading = screen.getByText(/How does the collector work?/i);
  expect(heading).toBeInTheDocument();

  let content = screen.queryByText(/The collector gathers all the articles/i);
  expect(content).not.toBeInTheDocument();

  fireEvent.click(heading);

  content = screen.getByText(/The collector gathers all the articles/i);
  expect(content).toBeInTheDocument();
});