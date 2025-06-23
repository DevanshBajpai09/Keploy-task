import { createServer } from 'http';
import next from 'next';
import fetch from 'node-fetch';

let server;
const app = next({ dev: true });
const handle = app.getRequestHandler();
const PORT = 4000;

beforeAll(async () => {
  await app.prepare();
  await new Promise((resolve) => {
    server = createServer((req, res) => handle(req, res)).listen(PORT, resolve);
  });
}, 30000); // longer timeout for Next.js boot

afterAll(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

describe('POST /api/notifications (App Router)', () => {
  it(
    'should respond with 200 and success true',
    async () => {
      const response = await fetch(`http://localhost:${PORT}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_user',
          message: 'Hello from test',
          type: 'inapp',
        }),
      });

      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.userId).toBe('test_user');
    },
    15000 // allow longer timeout
  );
});
