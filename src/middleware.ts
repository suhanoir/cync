import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'cync_default_secret_key_change_in_production_min_32_characters'
);

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/activity',
  '/workouts',
  '/progress',
  '/squads',
  '/goals',
  '/notifications',
  '/profile',
  '/settings',
  '/onboarding',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('cync_session')?.value;

  let isAuthenticated = false;
  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
      if (payload.userId) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isProtected && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
