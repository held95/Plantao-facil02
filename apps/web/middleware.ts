import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@plantao/backend';

// Routes that require coordinator or admin role
const COORDINATOR_ONLY_ROUTES = [
  '/logs',
  '/coordenadores',
  '/criar',
  '/gerenciar',
];

// Routes that are public (no authentication required)
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

function isProtectedCoordinatorRoute(pathname: string): boolean {
  return COORDINATOR_ONLY_ROUTES.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes (especially NextAuth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session || !session.user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Check role-based access for coordinator-only routes
  if (isProtectedCoordinatorRoute(pathname)) {
    const userRole = session.user.role;

    if (userRole !== 'coordenador' && userRole !== 'admin') {
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'access_denied');
      url.searchParams.set('message', 'Você não tem permissão para acessar esta página');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
