import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { expect, test, vi } from 'vitest';

test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Bla bla click me</Button>);

  const button = screen.getByText(/Bla bla click me/i);
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalled();
});