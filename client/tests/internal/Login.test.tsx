import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '@/features/user/Login';
import * as authFunctions from '@/services/authfunctions';
import { toast } from 'sonner';

vi.mock('@/services/authfunctions', () => ({
  loginUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Login Component', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByAltText('News Article Collector Logo')).toBeInTheDocument();
    expect(screen.getByText('News Article Collector')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLoginResponse = { access_token: 'mock-token' };
    vi.mocked(authFunctions.loginUser).mockResolvedValue(mockLoginResponse);

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: 'Log in' });

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authFunctions.loginUser).toHaveBeenCalledWith('testpassword');
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it('handles login failure', async () => {
    vi.mocked(authFunctions.loginUser).mockResolvedValue(null);

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: 'Log in' });

    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authFunctions.loginUser).toHaveBeenCalledWith('wrongpassword');
      expect(toast.error).toHaveBeenCalledWith('Failed to login');
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles login error', async () => {
    vi.mocked(authFunctions.loginUser).mockRejectedValue(new Error('Network error'));

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: 'Log in' });

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authFunctions.loginUser).toHaveBeenCalledWith('testpassword');
      expect(toast.error).toHaveBeenCalledWith('Login failed: Network error');
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });
  });
});
