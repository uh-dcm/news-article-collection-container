
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { serverUrl } from '../../src/config';

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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

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
    const query = url.searchParams.get('textQuery');
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
  // CAUTION: mocks are not perfect and always validate everything, 
  // although that should be fine for now
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
  }),
];

const server = setupServer(...handlers);

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

// MockEventSource class
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

describe('API handlers', () => {
  it('should fetch feed URLs', async () => {
    const response = await fetch(`${serverUrl}/api/get_feed_urls`);
    const data = await response.json();
    expect(data).toEqual(['https://www.blubblub.com/feed/']);
  });

  it('should return status', async () => {
    const response = await fetch(`${serverUrl}/api/status`);
    const data = await response.json();
    expect(data).toEqual({ status: 'stopped' });
  });

  it('should start the service', async () => {
    const response = await fetch(`${serverUrl}/api/start`, { method: 'POST' });
    expect(response.status).toBe(200);
  });

  it('should stop the service', async () => {
    const response = await fetch(`${serverUrl}/api/stop`, { method: 'POST' });
    expect(response.status).toBe(200);
  });

  it('should search articles', async () => {
    const response = await fetch(`${serverUrl}/api/articles/search?textQuery=test`);
    const data = await response.json();
    expect(data).toEqual(expect.any(Array));
  });

  it('should set feed URLs', async () => {
    const newFeed = ['https://www.newfeed.com/feed/'];
    const response = await fetch(`${serverUrl}/api/set_feed_urls`, {
      method: 'POST',
      body: JSON.stringify(newFeed),
    });
    const data = await response.json();
    expect(data).toEqual(newFeed);
  });

  it('should check if user exists', async () => {
    const response = await fetch(`${serverUrl}/api/get_user_exists`);
    const data = await response.json();
    expect(data).toEqual({ exists: true });
  });

  it('should register a user', async () => {
    const response = await fetch(`${serverUrl}/api/register`, { method: 'POST' });
    const data = await response.json();
    expect(data).toEqual({ message: 'User registered successfully' });
  });

  it('should validate token', async () => {
    const response = await fetch(`${serverUrl}/api/get_is_valid_token`);
    const data = await response.json();
    expect(data).toEqual({ valid: true });
  });

  it('should login a user', async () => {
    const response = await fetch(`${serverUrl}/api/login`, { method: 'POST' });
    const data = await response.json();
    expect(data).toEqual({ access_token: 'mock-access-token' });
  });

  it('should remove a user', async () => {
    const response = await fetch(`${serverUrl}/api/remove_user`, { method: 'POST' });
    const data = await response.json();
    expect(data).toEqual({ message: 'User removed successfully' });
  });

  it('should handle event stream', async () => {
    const response = await fetch(`${serverUrl}/stream`);
    const data = await response.text();
    expect(data).toBe('data: {"is_active":false}\n\n');
  });

  // New test cases
  it('should return empty array for empty search query', async () => {
    const response = await fetch(`${serverUrl}/api/articles/search?textQuery=`);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('should handle invalid endpoint', async () => {
    const response = await fetch(`${serverUrl}/api/invalid_endpoint`);
    expect(response.status).toBe(404);
  });

  it('should handle server error', async () => {
    server.use(
      http.get(`${serverUrl}/api/status`, () => {
        return new HttpResponse('Internal Server Error', { status: 500 });
      })
    );
    const response = await fetch(`${serverUrl}/api/status`);
    expect(response.status).toBe(500);
  });
});