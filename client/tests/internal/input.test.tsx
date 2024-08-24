
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders input component', () => {
    render(<Input placeholder="Bla bla" />);
    const inputElement = screen.getByPlaceholderText('Bla bla');
    expect(inputElement).toBeInTheDocument();
  });

  it('handles input change', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Bla bla" onChange={handleChange} />);
    const inputElement = screen.getByPlaceholderText('Bla bla') as HTMLInputElement;

    fireEvent.change(inputElement, { target: { value: 'Lorem ipsum' } });
    expect(handleChange).toHaveBeenCalled();
    expect(inputElement.value).toBe('Lorem ipsum');
  });

  it('renders input component with type password', () => {
    render(<Input type="password" placeholder="Enter password" />);
    const inputElement = screen.getByPlaceholderText('Enter password');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'password');
  });

  it('renders input component with type number', () => {
    render(<Input type="number" placeholder="Enter number" />);
    const inputElement = screen.getByPlaceholderText('Enter number');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'number');
  });
/* 
  it('handles empty input', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Bla bla" onChange={handleChange} />);
    const inputElement = screen.getByPlaceholderText('Bla bla') as HTMLInputElement;

    fireEvent.change(inputElement, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalled();
    expect(inputElement.value).toBe('');
  }); */

test('handles empty input', () => {
  const handleChange = jest.fn(); // Mock the handleChange function
  render(<Input handleChange={handleChange} />);
  
  const inputElement = screen.getByRole('textbox');
  fireEvent.change(inputElement, { target: { value: '' } });
  
  expect(handleChange).toHaveBeenCalled(); // Ensure the handleChange function is called
  expect(inputElement.value).toBe(''); // Ensure the input value is empty
});
/* 
  it('handles max length', () => {
    render(<Input placeholder="Bla bla" maxLength={10} />);
    const inputElement = screen.getByPlaceholderText('Bla bla') as HTMLInputElement;

    fireEvent.change(inputElement, { target: { value: '12345678901' } });
    expect(inputElement.value).is('1234567890');
  }); */

  test('handles max length', () => {
    const handleChange = jest.fn(); // Mock the handleChange function
    render(<Input handleChange={handleChange} maxLength={10} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: '12345678901' } });
    
    expect(inputElement.value).toBe('1234567890'); // Ensure the input value is truncated to maxLength
  });

  it('renders disabled input', () => {
    render(<Input placeholder="Bla bla" disabled />);
    const inputElement = screen.getByPlaceholderText('Bla bla');
    expect(inputElement).toBeDisabled();
  });
});
