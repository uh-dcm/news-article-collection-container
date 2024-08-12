
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { expect, test, vi, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
  
test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Bla bla click me</Button>);

  const button = screen.getByText(/Bla bla click me/i);
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalled();
});

// Test for different button types 
//(e.g., primary, secondary, disabled).
test('renders primary button', () => {
  render(<Button type="primary">Primary Button</Button>);

  const button = screen.getByText(/Primary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('primary');
});

test('renders secondary button', () => {
  render(<Button type="secondary">Secondary Button</Button>);

  const button = screen.getByText(/Secondary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('secondary');
});

test('renders disabled button', () => {
  render(<Button disabled>Disabled Button</Button>);

  const button = screen.getByText(/Disabled Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

// Test for empty button text.
test('handles empty button text', () => {
  render(<Button></Button>);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('');
});

// Verify specific classes or styles if applicable.
test('applies custom class to button', () => {
  render(<Button className="custom-class">Custom Class Button</Button>);

  const button = screen.getByText(/Custom Class Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('custom-class');
});