import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { serverUrl } from './App';

const handlers = [
  http.get(`${serverUrl}/api/get_feed_urls`, () => {
    return new HttpResponse(
      JSON.stringify(['https://www.androidauthority.com/feed/']),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
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
