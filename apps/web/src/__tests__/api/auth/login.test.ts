
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/login', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return a success status and set a session cookie', async () => {
      const req = new NextRequest(new Request('http://localhost/api/auth/login', {
        method: 'POST',
      }));

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');

      const cookie = response.headers.get('Set-Cookie');
      expect(cookie).not.toBeNull();
      expect(cookie).toContain('__session');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Path=/');
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should return 501 Not Implemented', async () => {
      const req = new NextRequest(new Request('http://localhost/api/auth/login', {
        method: 'POST',
      }));
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(501);
      expect(body.error).toBe('Not implemented');
    });
  });
});
