
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/logout/route';

describe('POST /api/auth/logout', () => {
  it('should return a success status and clear the session cookie', async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('success');

    const cookie = response.headers.get('Set-Cookie');
    expect(cookie).not.toBeNull();
    expect(cookie).toContain("__session=");
    expect(cookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });
});
