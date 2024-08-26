
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button as UIButton } from '@/components/ui/button'; // Renamed import to avoid conflict
import { expect, test, vi} from 'vitest';

test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<UIButton onClick={handleClick}>Bla bla click me</UIButton>);

  const button = screen.getByText(/Bla bla click me/i);
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalled();
});