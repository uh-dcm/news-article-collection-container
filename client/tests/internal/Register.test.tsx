import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '@/features/user/Register';
import * as authFunctions from '@/services/authfunctions';
import { toast } from 'sonner';

vi.mock('@/services/authfunctions', () => ({
  registerUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('Register Component', () => {
  const mockOnRegistrationSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register onRegistrationSuccess={mockOnRegistrationSuccess} />
      </BrowserRouter>
    );
  };

  it('renders register form correctly', () => {
    renderRegister();
    expect(screen.getByAltText('News Article Collector Logo')).toBeInTheDocument();
    expect(screen.getByText('News Article Collector')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('handles successful registration', async () => {
    vi.mocked(authFunctions.registerUser).mockResolvedValue({ success: true, data: {}, emailSent: true });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(authFunctions.registerUser).toHaveBeenCalledWith('test@example.com', 'password123', false);
      expect(toast.success).toHaveBeenCalledWith('Registration successful!');
      expect(mockOnRegistrationSuccess).toHaveBeenCalled();
    });
  });

  it('handles registration failure', async () => {
    vi.mocked(authFunctions.registerUser).mockResolvedValue({ success: false, error: 'Registration failed' });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(authFunctions.registerUser).toHaveBeenCalledWith('test@example.com', 'password123', false);
      expect(toast.error).toHaveBeenCalledWith('Failed to register: Registration failed');
      expect(mockOnRegistrationSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles registration with email sending issue', async () => {
    vi.mocked(authFunctions.registerUser).mockResolvedValue({ success: true, data: {}, emailSent: false });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(authFunctions.registerUser).toHaveBeenCalledWith('test@example.com', 'password123', false);
      expect(toast.success).toHaveBeenCalledWith('Registration successful!');
      expect(toast.warning).toHaveBeenCalledWith('Registration successful, but there was an issue sending the confirmation email. You can still use the app.', { duration: 10000 });
      expect(mockOnRegistrationSuccess).toHaveBeenCalled();
    });
  });
});
