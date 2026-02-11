import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Next.js Middleware for Route Protection
 *
 * This middleware runs at the edge, before pages are rendered,
 * providing an additional layer of security. It checks user
 * authentication and authorization before allowing access to
 * protected routes.
 *
 * Protected routes:
 * - /logs → Coordinators and admins only
 * - /coordenadores → Coordinators and admins only
 * - /criar → Coordinators and admins only
 * - /gerenciar → Coordinators and admins only
 */

// Routes that require coordinator or admin role
const COORDINATOR_ONLY_ROUTES = [
  '/logs',
  '/coordenadores',
  '/criar',
  '/gerenciar',
];

// Routes that are public (no authentication required)
const PUBLIC_ROUTES = ['/login'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for API routes (especially NextAuth)
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
  if (COORDINATOR_ONLY_ROUTES.includes(pathname)) {
    const userRole = session.user.role;

    if (userRole !== 'coordenador' && userRole !== 'admin') {
      // Redirect to dashboard with error message
      const url = new URL('/', request.url);
      url.searchParams.set(
        'error',
        'access_denied'
      );
      url.searchParams.set(
        'message',
        'Você não tem permissão para acessar esta página'
      );
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Matcher configuration for middleware
 * Defines which routes should run through this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
