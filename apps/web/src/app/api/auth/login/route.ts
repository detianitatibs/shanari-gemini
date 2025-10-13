
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  // For development, use a mock session
  if (process.env.NODE_ENV === 'development') {
    const sessionCookie = JSON.stringify({ email: 'dev@example.com', name: 'Dev User' });
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: false, // In dev, secure is false
      path: '/',
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });
    return response;
  }

  // For production, verify the token and create a real session
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    // Check if the user is an admin
    const adminEmails = (process.env.ADMIN_EMAIL_LIST || '').split(',');
    if (!decodedToken.email || !adminEmails.includes(decodedToken.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'success' });
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
