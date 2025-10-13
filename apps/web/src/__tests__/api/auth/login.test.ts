
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

// Define stable mock functions first
const mockVerifyIdToken = jest.fn();
const mockCreateSessionCookie = jest.fn();

// Mock the firebase-admin library to use the stable mock functions
jest.mock('@/lib/firebase/admin', () => ({
  firebaseAdmin: {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken,
      createSessionCookie: mockCreateSessionCookie,
    }),
  },
}));

describe('POST /api/auth/login', () => {
  let originalNodeEnv: string | undefined;
  let originalAdminEmailList: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    originalAdminEmailList = process.env.ADMIN_EMAIL_LIST;
    mockVerifyIdToken.mockClear();
    mockCreateSessionCookie.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ADMIN_EMAIL_LIST = originalAdminEmailList;
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return a mock session cookie', async () => {
      const req = new NextRequest(new Request('http://localhost/api/auth/login', { method: 'POST' }));
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      const cookie = response.headers.get('Set-Cookie');
      expect(cookie).toContain('__session');
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.ADMIN_EMAIL_LIST = 'admin@example.com,test@example.com';
    });

    it('should create a session cookie for an authorized admin user', async () => {
      const idToken = 'valid-admin-token';
      const mockDecodedToken = { email: 'admin@example.com', uid: '123' };
      const mockSessionCookie = 'mock-session-cookie';

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
      mockCreateSessionCookie.mockResolvedValue(mockSessionCookie);

      const req = new NextRequest(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      }));

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      const cookie = response.headers.get('Set-Cookie');
      expect(cookie).toContain(`__session=${mockSessionCookie}`);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
    });

    it('should return 403 for a non-admin user', async () => {
      const idToken = 'valid-non-admin-token';
      const mockDecodedToken = { email: 'user@example.com', uid: '456' };

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      const req = new NextRequest(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      }));

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe('Unauthorized');
    });

    it('should return 400 if idToken is missing', async () => {
      const req = new NextRequest(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      }));

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('ID token is required');
    });

    it('should return 500 if token verification fails', async () => {
      const idToken = 'invalid-token';
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const req = new NextRequest(new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      }));

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Internal Server Error');
    });
  });
});
