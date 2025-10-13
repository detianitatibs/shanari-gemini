
import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the session cookie
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
