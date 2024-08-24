import { sendSearchQuery, sendStatisticsQuery } from '@/services/database-queries';
import authClient from '@/services/authclient';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/services/authclient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send search query successfully', async () => {
    const mockResponse = { data: [], total_count: 10, page: 1 };
    vi.mocked(authClient.get).mockResolvedValueOnce({ data: mockResponse });

    const response = await sendSearchQuery({ generalQuery: 'test' });
    expect(response).toEqual(mockResponse);
  });

  it('should handle statistics query', async () => {
    const mockResponse = { data: { count: 100 } };
    vi.mocked(authClient.get).mockResolvedValueOnce({ data: mockResponse });

    const response = await sendStatisticsQuery(true);
    expect(response).toEqual(mockResponse);
  });
});
