import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Info from '@/features/info/Info';
import { expect, test, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

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

// Test for different accordion items.
test('renders another accordion item and toggles content', () => {
  render(<Info />);

  const heading = screen.getByText(/How to add a new feed?/i);
  expect(heading).toBeInTheDocument();

  let content = screen.queryByText(/To add a new feed, click on the "Add Feed" button/i);
  expect(content).not.toBeInTheDocument();

  fireEvent.click(heading);

  content = screen.getByText(/To add a new feed, click on the "Add Feed" button/i);
  expect(content).toBeInTheDocument();
});

// Test for empty content.
test('renders accordion item with empty content', () => {
  render(<Info />);

  const heading = screen.getByText(/Empty Question?/i);
  expect(heading).toBeInTheDocument();

  let content = screen.queryByText(/This is an empty answer/i);
  expect(content).not.toBeInTheDocument();

  fireEvent.click(heading);

  content = screen.getByText(/This is an empty answer/i);
  expect(content).toBeInTheDocument();
});