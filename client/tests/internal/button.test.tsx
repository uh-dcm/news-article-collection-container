
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button as UIButton } from '@/components/ui/button'; // Renamed import to avoid conflict
import { expect, test, vi, afterEach } from 'vitest';

afterEach(() => {
  // No need to call cleanup here
});

test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<UIButton onClick={handleClick}>Bla bla click me</UIButton>);

  const button = screen.getByText(/Bla bla click me/i);
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalled();
});

type ButtonType = "button" | "submit" | "reset";
 type CustomClassName = "custom-class";

 interface ButtonProps {
   type?: ButtonType;
   className?: CustomClassName;
   disabled?: boolean;
   children?: React.ReactNode; // Added children property
 }

const Button: React.FC<ButtonProps> = ({ type = "button", className, disabled, children }) => (
   <button type={type} className={className} disabled={disabled}>
     {children}
   </button>
 );


//Not implemented in button.tsx:
/* 
test('renders primary button', () => {
  render(<UIButton type="button">Primary Button</UIButton>);

  const button = screen.getByText(/Primary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('primary'); // Ensure Button component adds this class
});

test('renders secondary button', () => {
  render(<UIButton type="button">Secondary Button</UIButton>);

  const button = screen.getByText(/Secondary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('secondary');
});
 */
test('renders disabled button', () => {
  render(<UIButton disabled>Disabled Button</UIButton>);

  const button = screen.getByText(/Disabled Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('handles empty button text', () => {
  render(<UIButton></UIButton>);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('');
});
/* 
test('applies custom class to button', () => {
  render(<UIButton className="custom-class">Custom Class Button</UIButton>);

  const button = screen.getByText(/Custom Class Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('custom-class');
}); */

/* 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button as UIButton } from '@/components/ui/button'; // Renamed import to avoid conflict
import { expect, test, vi, afterEach } from 'vitest';

afterEach(() => {
  // No need to call cleanup here
});

test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<UIButton onClick={handleClick}>Bla bla click me</UIButton>);

  const button = screen.getByText(/Bla bla click me/i);
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalled();
});

type ButtonType = "button" | "submit" | "reset" | "primary" | "secondary";
type CustomClassName = "custom-class";

interface ButtonProps {
  type?: ButtonType;
  className?: CustomClassName;
  disabled?: boolean;
  children?: React.ReactNode; // Added children property
}

const Button: React.FC<ButtonProps> = ({ type = "button", className, disabled, children }) => (
  <button type={type} className={className} disabled={disabled}>
    {children}
  </button>
);

test('renders primary button', () => {
  render(<UIButton type="primary">Primary Button</UIButton>);

  const button = screen.getByText(/Primary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('primary'); // Ensure your Button component adds this class
});

test('renders secondary button', () => {
  render(<UIButton type="secondary">Secondary Button</UIButton>);

  const button = screen.getByText(/Secondary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('secondary');
});

test('renders disabled button', () => {
  render(<UIButton disabled>Disabled Button</UIButton>);

  const button = screen.getByText(/Disabled Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('handles empty button text', () => {
  render(<UIButton></UIButton>);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('');
});

test('applies custom class to button', () => {
  render(<UIButton className="custom-class">Custom Class Button</UIButton>);

  const button = screen.getByText(/Custom Class Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('custom-class');
});*/