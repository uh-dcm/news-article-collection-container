import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Errors from '@/features/errors/Errors';
import * as logRecords from '@/features/errors/log-records';
import { toast } from 'sonner';

vi.mock('@/features/errors/log-records', () => ({
  getLogRecords: vi.fn(),
  clearLogRecords: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Errors Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error log correctly', async () => {
    vi.mocked(logRecords.getLogRecords).mockResolvedValue(['Error 1', 'Error 2']);
    render(<Errors />);

    await waitFor(() => {
      expect(screen.getByText('Error log')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });
  });

  it('handles empty error log', async () => {
    vi.mocked(logRecords.getLogRecords).mockResolvedValue([]);
    render(<Errors />);

    await waitFor(() => {
      expect(screen.getByText('No error log.')).toBeInTheDocument();
    });
  });

  it('clears error log', async () => {
    vi.mocked(logRecords.getLogRecords).mockResolvedValue(['Error 1']);
    vi.mocked(logRecords.clearLogRecords).mockResolvedValue();
    
    render(<Errors />);

    await waitFor(() => {
      expect(screen.getByText('Error 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Log' }));

    const confirmButtons = screen.getAllByRole('button', { name: 'Clear Log' });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(logRecords.clearLogRecords).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Log cleared successfully');
    });
  });

  it('handles clear log error', async () => {
    vi.mocked(logRecords.getLogRecords).mockResolvedValue(['Error 1']);
    vi.mocked(logRecords.clearLogRecords).mockRejectedValue(new Error('Clear failed'));
    
    render(<Errors />);

    await waitFor(() => {
      expect(screen.getByText('Error 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Log' }));

    const confirmButtons = screen.getAllByRole('button', { name: 'Clear Log' });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(logRecords.clearLogRecords).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to clear log');
    });
  });
});