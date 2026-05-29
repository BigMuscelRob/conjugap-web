import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profil', '/profile'];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // NextAuth v5 setzt diesen Cookie nach erfolgreichem Login
  const sessionCookie =
    req.cookies.get('__Secure-authjs.session-token') ??
    req.cookies.get('authjs.session-token');

  if (!sessionCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profil/:path*',
    '/profile/:path*',
  ],
};
