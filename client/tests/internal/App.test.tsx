import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import App from '@/App';
import '@testing-library/jest-dom';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { MockEventSource } from './setupTests';
import { BrowserRouter as Router } from 'react-router-dom';
import { TooltipProvider } from '@radix-ui/react-tooltip';

describe('App component', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(global, 'EventSource').mockImplementation(
      (url: string | URL, eventSourceInitDict?: EventSourceInit) => 
        new MockEventSource(url, eventSourceInitDict)
    );
    render(
      <Router>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </Router>
    );

    await waitFor(() => {
      const registerView = screen.queryByTestId('register-view');
      const loginView = screen.queryByTestId('login-view');

      // Ensure the Register view is not present
      expect(registerView).not.toBeInTheDocument();

      // Ensure the Login view is not present
      expect(loginView).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Enter RSS feed URL/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('renders app component', async () => {
    expect(screen.getByText(/News Article Collector/i)).toBeInTheDocument();
    expect(await screen.findByText(/List of RSS feeds/i)).toBeInTheDocument();
  });

  test('submits RSS feed URLs', async () => {
    const toastSuccessSpy = vi.spyOn(toast, 'success');

    const input = screen.getByPlaceholderText('RSS feed address here...');
    fireEvent.change(input, { target: { value: 'https://blabla.com/feed' } });

    const addToListButton = screen.getByText(/Add to list/i);
    fireEvent.click(addToListButton);

    await waitFor(() => {
      expect(screen.getByText('https://blabla.com/feed')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith('Feed list updated successfully!');
    });
  });

  test('starts RSS fetching', async () => {
    const activateFetchButton = await screen.findByText(
      /Activate RSS fetching/i
    );
    fireEvent.click(activateFetchButton);

    await waitFor(() => {
      expect(screen.getByText(/Disable RSS fetching/i)).toBeInTheDocument();
    });
  });

  test('stops RSS fetching', async () => {
    const disableFetchButton = await screen.findByText(/Disable RSS fetching/i);
    fireEvent.click(disableFetchButton);

    await waitFor(() => {
      expect(screen.getByText(/Activate RSS fetching/i)).toBeInTheDocument();
    });
  });

  test('downloads articles in JSON format', async () => {
    const downloadButton = screen.getByRole('button', { name: /^JSON$/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          loading: 'Downloading...',
          success: expect.any(Function),
        })
      );
    });
  });

  test('downloads articles in CSV format', async () => {
    const downloadButton = screen.getByRole('button', { name: /^CSV$/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          loading: 'Downloading...',
          success: expect.any(Function),
        })
      );
    });
  });

  test('downloads articles in Parquet format', async () => {
    const downloadButton = screen.getByRole('button', { name: /^Parquet$/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          loading: 'Downloading...',
          success: expect.any(Function),
        })
      );
    });
  });

  // handler at setup is only using textQuery for now
  test('searches articles based on query', async () => {
    const searchLink = screen.getByRole('link', { name: /^Search$/ });
    fireEvent.click(searchLink);

    // fails without this wait
    await waitFor(() => {
      expect(screen.getByText(/Search articles/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const searchInput = screen.getByPlaceholderText('Insert text query...');
    const searchButton = screen.getByRole('button', { name: /Submit search/i });

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Full text 1' } });
      fireEvent.click(searchButton);
    });

    const fullText1 = screen.getByText('Full text 1', { exact: false });
    expect(fullText1).toBeInTheDocument();

    const fullText2 = screen.queryByText('Full text 2', { exact: false });
    expect(fullText2).not.toBeInTheDocument();
  });
});
