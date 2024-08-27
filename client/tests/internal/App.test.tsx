
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import '@testing-library/jest-dom';
import { expect, test, vi, describe, beforeEach } from 'vitest';
//import { toast } from 'sonner';
import { MockEventSource } from './setupTests';
import { BrowserRouter as Router } from 'react-router-dom';
import { TooltipProvider } from '@radix-ui/react-tooltip';

vi.mock('@/services/article-download', () => ({
  HandleArticleDownload: vi.fn()
}));

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

    waitFor(
      async () => {
        expect(screen.getByText(/RSS feeds/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
/* 
  test('renders app component', () => {
    expect(screen.getByText(/News Article Collector/i)).toBeInTheDocument();
    //expect(screen.getByText(/Add or delete feeds/i)).toBeInTheDocument();
  });

  test('submits RSS feed URLs', async () => {
    const toastSuccessSpy = vi.spyOn(toast, 'success');

    // const input = screen.getByText('Input RSS feed address here...');
    // fireEvent.change(input, { target: { value: 'https://blabla.com/feed' } });

    const addToListButton = screen.getByText(/Add to list/i);
    fireEvent.click(addToListButton);

    await waitFor(() => {
      expect(screen.getByText('https://blabla.com/feed')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith(
        'Feed list updated successfully!'
      );
    });
  });
 */
/* 
  test('removes RSS feed URLs', async () => {
    // Simulate adding a feed URL
    render(
      <Router>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </Router>
    );
  
    const input = screen.getByText('RSS feed address here...');
    fireEvent.change(input, { target: { value: 'https://blabla.com/feed' } });
  
    const addToListButton = screen.getByText(/Add to list/i);
    fireEvent.click(addToListButton);
  
    await waitFor(() => {
      expect(screen.getByText('https://blabla.com/feed')).toBeInTheDocument();
    });
  
    // Simulate removing the feed URL
    const removeButton = screen.getByText(/Remove/i);
    fireEvent.click(removeButton);
  
    await waitFor(() => {
      expect(screen.queryByText('https://blabla.com/feed')).not.toBeInTheDocument();
    });
  
    // Check if the success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Feed list updated successfully!')).toBeInTheDocument();
    });
  });
 */
});

  // note the use of userEvent which solved issues with dropdown menu
  const testDownloadOption = async (format: 'JSON' | 'CSV' | 'Parquet') => {
    const user = userEvent.setup();
    
    const downloadButton = screen.queryByText('Download All Articles');
    expect(downloadButton).toBeInTheDocument();
    user.click(downloadButton);

    waitFor(() => {
      expect(screen.getByText(format)).toBeInTheDocument();
    }, { timeout: 2000 });

    const formatOption = screen.getByLabelText(format);
    user.click(formatOption);

      expect(HandleArticleDownload).toHaveBeenCalledWith(
        format.toLowerCase() as 'json' | 'csv' | 'parquet',
        false,
        expect.any(Function)
      );
    };

  test('clicks JSON download option', async () => {
    testDownloadOption('JSON');
  });

  test('clicks CSV download option', async () => {
    testDownloadOption('CSV');
  });

  test('clicks Parquet download option', async () => {
    testDownloadOption('Parquet');
  });

    // Handles a download error
  test('handles download error', async () => {
    const errorMessage = 'Failed to download the file.';
  
    // Simulates a download error
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Failed to fetch'))
    );
  
    const serverUrl = 'http://localhost:4000';
    try {
      const response = await fetch(`${serverUrl}/api/get_feed_urls`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      //toast.error(errorMessage);
    }
  
    // Check if the error message is displayed in the DOM
    await (() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

/* 
  // Download error handling
  test('handles download error', async () => {
    const error = 'Failed to download the file.'
    const toastErrorSpy = vi.spyOn(toast, 'message');
  
    // Simulate a download error
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Failed to fetch'))
    );
  
    const serverUrl = 'http://localhost:4000';
    try {
      const response = await fetch(`${serverUrl}/api/get_feed_urls`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error('Failed to download the file.');
    }
  
    expect(toastErrorSpy).toHaveBeenCalledWith('Failed to download the file.');
  });
 */

  // Download error handling
 /*  test('handles download error', async () => {
    const errorMessage = 'Failed to download the file.';
    const toastErrorSpy = vi.spyOn(toast, 'error');
  
    // Simulate a download error
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Failed to fetch'))
    );
  
    const serverUrl = 'http://localhost:4000';
    try {
      const response = await fetch(`${serverUrl}/api/get_feed_urls`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error(errorMessage);
    }
  
    expect(toastErrorSpy).toHaveBeenCalledWith(errorMessage);
  }); */

//  handler at setup is only using generalQuery for now
/*   test('handles download error', async () => {
    const toastErrorSpy = vi.spyOn(toast, 'error');
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Download failed'))
    );

    const downloadButton = screen.getByRole('button', { name: /^JSON$/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Download failed');
    });
  });
*/

  // Test with a mocked server:
  test('searches articles based on query', async () => {
    const user = userEvent.setup();
  
      const searchLink = screen.getByRole('link', { name: /^Search$/ });
      await user.click(searchLink);
  
    waitFor(() => {
      expect(screen.getByText(/Search articles/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  
    const searchInput = screen.getByText('Insert query...');
    const searchButton = screen.getByRole('button', { name: /Search/i });
  
    await user.type(searchInput, 'Full text 1');
    //await user.click(searchButton);('link', { name: /^Search$/ });
    await fireEvent.click(searchButton);
  
    waitFor(() => {
      expect(screen.getByText('Full text 1.', { exact: false })).toBeInTheDocument();
      expect(screen.queryByText('Full text 2.', { exact: false })).not.toBeInTheDocument();
    }, { timeout: 2000 });
  
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(2);
  });

  test('handles no articles found during search', async () => {
    //never used
    //const searchLink = await screen.findByText

    waitFor(() => {
        expect(screen.getByText(/Search articles/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
  )
  
    waitFor(() => {

        const searchInput = screen.getByText('Insert text query...');
        const searchButton = screen.getByRole('button', { name: /Submit search/i });
      
        fireEvent.change(searchInput, { target: { value: 'invalid-query' } });
        fireEvent.click(searchButton);
    
        const noArticlesMessage = screen.getByText(/No articles found/i);
        expect(noArticlesMessage).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }); 
