import { vi, describe, it, expect, beforeEach } from 'vitest';
import { handleArticleDownload } from '@/services/article-download';
import { toast } from 'sonner';
import authClient from '@/services/authclient';

vi.mock('@/services/authclient', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: new Blob(['test data']) })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    dismiss: vi.fn(),
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('handleArticleDownload', () => {
  const mockSetIsDisabled = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    document.createElement = vi.fn((tagName: string) => {
      const element = {
        tagName,
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
        remove: vi.fn(),
      };
      return element as unknown as HTMLElement;
    });

    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  it('should toggle disabled state and trigger toast', async () => {
    await handleArticleDownload('json', false, mockSetIsDisabled);

    expect(mockSetIsDisabled).toHaveBeenCalledWith(true);
    expect(mockSetIsDisabled).toHaveBeenCalledWith(false);
    expect(toast.loading).toHaveBeenCalledWith('Preparing download...', expect.any(Object));
  });

  it('should handle different file formats', async () => {
    await handleArticleDownload('csv', false, mockSetIsDisabled);
    await handleArticleDownload('parquet', false, mockSetIsDisabled);

    expect(mockSetIsDisabled).toHaveBeenCalledTimes(4);
    expect(toast.loading).toHaveBeenCalledTimes(2);
  });

  it('should handle query exports', async () => {
    await handleArticleDownload('json', true, mockSetIsDisabled);

    expect(mockSetIsDisabled).toHaveBeenCalledTimes(2);
    expect(toast.loading).toHaveBeenCalled();
    expect(authClient.get).toHaveBeenCalledWith('/api/articles/export_query?format=json', expect.any(Object));
  });
});
