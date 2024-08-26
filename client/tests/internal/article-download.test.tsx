import { vi, describe, it, expect, beforeEach } from 'vitest';
import { handleArticleDownload } from '@/services/article-download';
import { toast } from 'sonner';

vi.mock('@/services/authclient', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: new Blob(['test data']) })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    dismiss: vi.fn(),
    promise: vi.fn((promiseFn) => promiseFn()),
  },
}));

describe('handleArticleDownload', () => {
  const mockSetIsDisabled = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    document.createElement = vi.fn(() => {
      const element = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
        remove: vi.fn(),
      };

      return new Proxy(element, {
        get: (target, prop) => {
          if (prop in target) {
            return target[prop as keyof typeof target];
          }
          if (typeof prop === 'string' && !['toString', 'valueOf'].includes(prop)) {
            return vi.fn();
          }
          return undefined;
        },
      }) as unknown as HTMLElement;
    });

    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  it('should toggle disabled state and trigger toast', async () => {
    await handleArticleDownload('json', false, mockSetIsDisabled);

    expect(mockSetIsDisabled).toHaveBeenCalledWith(true);
    expect(mockSetIsDisabled).toHaveBeenCalledWith(false);
    expect(toast.promise).toHaveBeenCalled();
  });

  it('should handle different file formats', async () => {
    await handleArticleDownload('csv', false, mockSetIsDisabled);
    await handleArticleDownload('parquet', false, mockSetIsDisabled);

    expect(mockSetIsDisabled).toHaveBeenCalledTimes(4);
    expect(toast.promise).toHaveBeenCalledTimes(2);
  });

  it('should handle query exports', async () => {
    await handleArticleDownload('json', true, mockSetIsDisabled);

    expect(mockSetIsDisabled).toHaveBeenCalledTimes(2);
    expect(toast.promise).toHaveBeenCalled();
  });
});
