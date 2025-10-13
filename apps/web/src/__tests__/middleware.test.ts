
/**
 * @jest-environment node
 */

import { middleware } from '@/middleware';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Mock the NextResponse methods
const mockRedirect = jest.spyOn(NextResponse, 'redirect');
const mockNext = jest.spyOn(NextResponse, 'next');

describe('Middleware', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    mockRedirect.mockClear();
    mockNext.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should call next() for any admin path', () => {
      const req = new NextRequest(new Request('http://localhost/admin/dashboard'));
      middleware(req);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should redirect to /login if accessing /admin without a session cookie', () => {
      const req = new NextRequest(new Request('http://localhost/admin'));
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith(new URL('/login', 'http://localhost/'));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if accessing /admin with a session cookie', () => {
      const req = new NextRequest(new Request('http://localhost/admin/posts'));
      req.cookies.set('__session', 'fake-session-token');
      middleware(req);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should not interfere with non-admin paths', () => {
      // The middleware's config `matcher` should prevent this from running,
      // but we test the logic just in case.
      const req = new NextRequest(new Request('http://localhost/'));
      middleware(req);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
