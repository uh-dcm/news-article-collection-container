import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { serverUrl } from '@/App';

/* Disable undefined function in Jest */
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const handlers = [
  http.get(`${serverUrl}/api/get_feed_urls`, () => {
    return new HttpResponse(
      JSON.stringify(['https://www.blubblub.com/feed/']),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }),
  http.get(`${serverUrl}/api/status`, () => {
    return new HttpResponse(
      JSON.stringify({ status: 'stopped' }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }),
  http.post(`${serverUrl}/api/start`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post(`${serverUrl}/api/stop`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.get(`${serverUrl}/api/articles/search`, async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('searchQuery');

    if (!query) {
      return HttpResponse.json([]);
    }

    const filteredData = testData.filter(article => 
      article.full_text.toLowerCase().includes(query.toLowerCase())
    );

    return HttpResponse.json(filteredData);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

export const testData = [
  {
    time: '2016-06-06 09:09:09',
    url: 'https://blabla.com/1',
    full_text: 'Full text 1.',
  },
  {
    time: '2016-06-06 09:09:09',
    url: 'https://blabla.com/2',
    full_text: 'Full text 2.',
  },
];