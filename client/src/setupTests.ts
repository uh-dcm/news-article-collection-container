import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterAll, afterEach } from 'vitest';

const handlers = [
  http.get('http://localhost:4000/api/get_feed_urls', (req) => {
    return new HttpResponse(JSON.stringify(['https://www.androidauthority.com/feed/']), {
      headers: { 'Content-Type': 'application/json' },
    });
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
