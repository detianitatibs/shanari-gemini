
import 'server-only';
import type { NextRequest } from 'next/server';

// This is a simplified session management for demonstration purposes.
// In a real-world application, use a robust library like next-auth or iron-session.

interface AdminUser {
  id: number;
  name: string;
  email: string;
}

const MOCK_ADMIN_USER: AdminUser = {
  id: 1,
  name: 'Dev User',
  email: 'dev@example.com',
};

/**
 * Retrieves the current admin user session.
 * In development, it returns a mock user.
 * In production, it would verify the session cookie against a trusted source.
 * @param request - The NextRequest object.
 * @returns The admin user object or null if not authenticated.
 */
export async function getSession(
  request: NextRequest,
): Promise<AdminUser | null> {
  if (process.env.NODE_ENV === 'development') {
    return MOCK_ADMIN_USER;
  }

  const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    // TODO: Implement actual session verification
    // 1. Decrypt the session cookie
    // 2. Verify the token (e.g., with Firebase Admin SDK)
    // 3. Fetch user details from the database
    // For now, we'll just parse the JSON from the cookie as a placeholder
    const session = JSON.parse(sessionCookie);

    // Basic validation
    if (session && session.email) {
      // In a real app, you'd look up the user in the DB from the session data
      return {
        id: 1, // Placeholder ID
        name: session.name || 'Admin',
        email: session.email,
      };
    }
    return null;
  } catch (error) {
    console.error('Session parsing failed', error);
    return null;
  }
}
