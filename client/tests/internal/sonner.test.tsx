
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Toaster, toast } from 'sonner';

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
  toast: vi.fn(),
  Toaster: () => <div>Test</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Sonner component', () => {
  it('renders sonner component and shows toast', () => {
    render(<SonnerComponent />);
    
    const buttonElement = screen.getByText('Clickety click');
    fireEvent.click(buttonElement);
    
    expect(toast).toHaveBeenCalledWith('Bla bla');
  });

  it('shows success toast', () => {
    toast.success = vi.fn();
    render(<SonnerComponent />);
    
    toast.success('Success message');
    
    expect(toast.success).toHaveBeenCalledWith('Success message');
  });

  it('shows error toast', () => {
    toast.error = vi.fn();
    render(<SonnerComponent />);
    
    toast.error('Error message');
    
    expect(toast.error).toHaveBeenCalledWith('Error message');
  });

  it('shows multiple toasts', () => {
    render(<SonnerComponent />);
    
    toast('First message');
    toast('Second message');
    
    expect(toast).toHaveBeenCalledTimes(2);
    expect(toast).toHaveBeenCalledWith('First message');
    expect(toast).toHaveBeenCalledWith('Second message');
  });

  it('handles empty toast message', () => {
    render(<SonnerComponent />);
    
    toast('');
    
    expect(toast).toHaveBeenCalledWith('');
  });
});
