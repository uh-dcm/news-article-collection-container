import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input component', () => {
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
});
