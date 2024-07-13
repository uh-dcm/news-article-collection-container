import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { serverUrl } from '../../src/config';

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
    return new HttpResponse(JSON.stringify({ status: 'stopped' }), {
      headers: { 'Content-Type': 'application/json' },
    });
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
    const filteredData = testData.filter((article) =>
      article.full_text.toLowerCase().includes(query.toLowerCase())
    );
    return HttpResponse.json(filteredData);
  }),

  http.post(`${serverUrl}/api/set_feed_urls`, async ({ request }) => {
    const newFeed = await request.json();
    return HttpResponse.json(newFeed, { status: 200 });
  }),

  // CAUTION: mocks are not perfect and always validate everything, although that should be fine for now
  http.get(`${serverUrl}/api/get_user_exists`, () => {
    return new HttpResponse(JSON.stringify({ exists: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  http.post(`${serverUrl}/api/register`, () => {
    return new HttpResponse(
      JSON.stringify({ message: 'User registered successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  http.get(`${serverUrl}/api/get_is_valid_token`, () => {
    return new HttpResponse(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  http.post(`${serverUrl}/api/login`, () => {
    return new HttpResponse(
      JSON.stringify({ access_token: 'mock-access-token' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  http.post(`${serverUrl}/api/remove_user`, () => {
    return new HttpResponse(
      JSON.stringify({ message: 'User removed successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  http.get(`${serverUrl}/stream`, () => {
    return new HttpResponse('data: {"is_active":false}\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  })
];

const server = setupServer(...handlers);

// this is just for the processing check stream
export class MockEventSource implements EventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  readonly CONNECTING: 0 = MockEventSource.CONNECTING;
  readonly OPEN: 1 = MockEventSource.OPEN;
  readonly CLOSED: 2 = MockEventSource.CLOSED;

  onerror: ((this: EventSource, ev: Event) => unknown) | null = null;
  onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null = null;
  onopen: ((this: EventSource, ev: Event) => unknown) | null = null;
  readyState: 0 | 1 | 2 = MockEventSource.CONNECTING;
  url: string;
  withCredentials: boolean;

  constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
    this.url = url.toString();
    this.withCredentials = eventSourceInitDict?.withCredentials ?? false;
  }

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
  close = vi.fn();
}
global.EventSource = MockEventSource as typeof EventSource;

beforeAll(async () => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
  // create a new user and login
  localStorage.setItem('accessToken', 'mock-access-token');
});

afterEach(() => {
  // CAUTION: does not clear the localStorage
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

export const testData = [
  {
    // id: '1',
    time: '2016-06-06 09:09:09',
    url: 'https://blabla.com/1',
    // html: '<!DOCTYPE html><html lang="fi"><head>',
    full_text: 'Full text 1.',
    // download_time: '2024-04-04 08:08:08.777777',
  },
  {
    // id: '2',
    time: '2016-06-06 09:09:09',
    url: 'https://blabla.com/2',
    // html: '<p>Html 2</p>',
    full_text: 'Full text 2.',
    // download_time: '2024-04-04 08:08:08.777777',
  },
];
