import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReregisterValidator from '@/features/user/ReregisterValidator';
import * as authFunctions from '@/services/authfunctions';
import { toast } from 'sonner';

vi.mock('@/services/authfunctions', () => ({
  validateReregisterToken: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    custom: vi.fn(),
  },
}));

describe('ReregisterValidator Component', () => {
  const mockOnValidationComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReregisterValidator = (token: string) => {
    return render(
      <MemoryRouter initialEntries={[`/reregister/${token}`]}>
        <Routes>
          <Route path="/reregister/:token" element={<ReregisterValidator onValidationComplete={mockOnValidationComplete} />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('displays loading message while validating', () => {
    renderReregisterValidator('valid-token');
    expect(screen.getByText('Validating reregistration token...')).toBeInTheDocument();
  });

  it('handles valid token', async () => {
    vi.mocked(authFunctions.validateReregisterToken).mockResolvedValue({ valid: true });
    renderReregisterValidator('valid-token');

    await waitFor(() => {
      expect(authFunctions.validateReregisterToken).toHaveBeenCalledWith('valid-token');
      expect(toast.custom).toHaveBeenCalled();
      expect(mockOnValidationComplete).toHaveBeenCalledWith(true);
    });
  });

  it('handles invalid token', async () => {
    vi.mocked(authFunctions.validateReregisterToken).mockResolvedValue({ valid: false });
    renderReregisterValidator('invalid-token');

    await waitFor(() => {
      expect(authFunctions.validateReregisterToken).toHaveBeenCalledWith('invalid-token');
      expect(toast.error).toHaveBeenCalledWith('Invalid or expired token');
      expect(mockOnValidationComplete).toHaveBeenCalledWith(false);
    });
  });

  it('handles validation error', async () => {
    vi.mocked(authFunctions.validateReregisterToken).mockRejectedValue(new Error('Validation failed'));
    renderReregisterValidator('error-token');

    await waitFor(() => {
      expect(authFunctions.validateReregisterToken).toHaveBeenCalledWith('error-token');
      expect(toast.error).toHaveBeenCalledWith('An error occurred when validating the token. Did it expire already?');
      expect(mockOnValidationComplete).toHaveBeenCalledWith(false);
    });
  });
});
