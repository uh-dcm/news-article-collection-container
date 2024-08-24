import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdvancedSearch from '@/features/search/advanced-search';
import { SearchProvider } from '@/features/search/search-context';

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('AdvancedSearch Component', () => {
  const mockOnSearchParamsChange = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnDownload = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAdvancedSearch = () => {
    return render(
      <SearchProvider>
        <AdvancedSearch
            searchParams={{}}
            onSearchParamsChange={mockOnSearchParamsChange}
            onSearch={mockOnSearch}
            onDownload={mockOnDownload}
            onClear={mockOnClear}
            isDownloadDisabled={false}
            resultCount={0}
        />
    </SearchProvider>
  );
};

  it('renders basic search form correctly', () => {
    renderAdvancedSearch();
    expect(screen.getByPlaceholderText('Insert query...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advanced' })).toBeInTheDocument();
  });

  it('toggles advanced search options', async () => {
    renderAdvancedSearch();
    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Insert text query...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Insert URL query...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Insert HTML query...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Insert start time... (YYYY-MM-DD HH:MM:SS)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Insert end time... (YYYY-MM-DD HH:MM:SS)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Insert text query...')).not.toBeInTheDocument();
    });
  });

  it('handles clear button click', () => {
    renderAdvancedSearch();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(mockOnClear).toHaveBeenCalled();
  });
});
