import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const token = req.auth;
  const path = req.nextUrl.pathname;

  // Se não está autenticado, redirecionar para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Rotas apenas para coordenadores e admins
  const coordinatorOnlyRoutes = ['/criar', '/logs', '/coordenadores'];

  if (coordinatorOnlyRoutes.some(route => path.startsWith(route))) {
    if (token.user?.role !== 'coordenador' && token.user?.role !== 'admin') {
      // Médico tentando acessar rota restrita → redirecionar para home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/plantoes/:path*',
    '/criar/:path*',
    '/logs/:path*',
    '/coordenadores/:path*',
    '/inscricoes/:path*',
    '/calendario/:path*',
    '/notificacoes/:path*',
    '/gerenciar/:path*',
  ],
};
