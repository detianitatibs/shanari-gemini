
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATH = '/admin';
const LOGIN_PATH = '/login';

export function middleware(request: NextRequest) {
  // In development, skip authentication for easier development.
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('__session');
  const { pathname } = request.nextUrl;

  // If accessing admin pages without a session, redirect to login.
  if (pathname.startsWith(ADMIN_PATH)) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
    // TODO: Add server-side session validation by calling an internal API.
    // If the session is invalid, redirect to login.
  }

  return NextResponse.next();
}

export const config = {
  // Match all admin paths except for API routes and static files.
  matcher: '/admin/:path*',
};
