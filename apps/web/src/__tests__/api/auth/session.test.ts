
/**
 * @jest-environment node
 */

import { GET } from '@/app/api/auth/session/route';
import { NextRequest } from 'next/server';
import * as sessionLib from '@/lib/auth/session';

// Mock the getSession library function
jest.mock('@/lib/auth/session');
const mockGetSession = sessionLib.getSession as jest.Mock;

describe('GET /api/auth/session', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if getSession returns null', async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new NextRequest(new Request('http://localhost/api/auth/session'));

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.isAuthenticated).toBe(false);
  });

  it('should return 200 and user data if getSession returns a user', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    mockGetSession.mockResolvedValue(mockUser);
    const req = new NextRequest(new Request('http://localhost/api/auth/session'));

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isAuthenticated).toBe(true);
    expect(body.user).toEqual(mockUser);
  });
});
