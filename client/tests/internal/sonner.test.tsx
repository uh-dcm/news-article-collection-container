import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const SonnerComponent: React.FC = () => {
  const showToast = () => {
    toast('Bla bla');
  };

  return (
    <div>
      <button onClick={showToast}>Clickety click</button>
      <Toaster />
    </div>
  );
};

vi.mock('sonner', () => ({
  toast: vi.fn((message) => {
    document.body.innerHTML += `<div class="toaster">${message}</div>`;
  }),
  Toaster: () => null,
}));

vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light' }) }));

describe('Sonner component', () => {
  it('renders sonner component and shows toast', () => {
    render(<SonnerComponent />);
    
    const buttonElement = screen.getByText('Clickety click');
    fireEvent.click(buttonElement);
    
    expect(toast).toHaveBeenCalledWith('Bla bla');
    expect(document.querySelector('.toaster')).toHaveTextContent('Bla bla');
  });
});
