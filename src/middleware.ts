export { auth as middleware } from '../auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/practice/:path*',
    '/profil/:path*',
    '/profile/:path*',
  ],
};
