
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

// type ButtonType = "button" | "submit" | "reset";
// type CustomClassName = "custom-class";

// interface ButtonProps {
//   type?: ButtonType;
//   className?: CustomClassName;
//   disabled?: boolean;
//   children?: React.ReactNode; // Added children property
// }

// const Button: React.FC<ButtonProps> = ({ type = "button", className, disabled, children }) => (
//   <button type={type} className={className} disabled={disabled}>
//     {children}
//   </button>
// );

test('renders primary button', () => {
  render(<UIButton type="button">Primary Button</UIButton>);

  const button = screen.getByText(/Primary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('primary'); // Ensure your Button component adds this class
});

test('renders secondary button', () => {
  render(<UIButton type="button">Secondary Button</UIButton>);

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
});



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
});

/* // new version of button tests

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { expect, test, vi, afterEach } from 'vitest';

afterEach(() => {
  // No need to call cleanup here
});

test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Bla bla click me</Button>);

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
}

const Button: React.FC<ButtonProps> = ({ type = "button", className, disabled, children }) => (
  <button type={type} className={className} disabled={disabled}>
    {children}
  </button>
);

test('renders primary button', () => {
  render(<Button type="primary">Primary Button</Button>);

  const button = screen.getByText(/Primary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('primary'); // Ensure your Button component adds this class
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

test('handles empty button text', () => {
  render(<Button></Button>);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('');
});

test('applies custom class to button', () => {
  render(<Button className="custom-class">Custom Class Button</Button>);

  const button = screen.getByText(/Custom Class Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('custom-class');
});

 */
/* 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { expect, test, vi, afterEach } from 'vitest';

afterEach(() => {
  // No need to call cleanup here
});

test('renders button component and handles click event', () => {
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Bla bla click me</Button>);

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
}

// Assuming Button is a component that accepts type and className props
const Button: React.FC<ButtonProps> = ({ type, className, children }) => (
  <button type={type} className={className}>
    {children}
  </button>
);

test('renders primary button', () => {
  render(<Button type="primary">Primary Button</Button>);

  const button = screen.getByText(/Primary Button/i);
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('primary'); // Ensure your Button component adds this class
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
}); */