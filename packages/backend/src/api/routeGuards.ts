import { NextResponse } from 'next/server';
import { auth } from '../auth/index';
import type { UserRole } from '@plantao/shared';

export interface AuthResult {
  session: any | null;
  error: NextResponse | null;
}

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();

  if (!session || !session.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Não autorizado. Por favor, faça login.' },
        { status: 401 }
      ),
    };
  }

  return { session, error: null };
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthResult> {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  const userRole = session?.user?.role as UserRole;
  if (!allowedRoles.includes(userRole)) {
    return {
      session: null,
      error: NextResponse.json(
        {
          error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
          requiredRoles: allowedRoles,
          userRole,
        },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

export async function requireCoordinator(): Promise<AuthResult> {
  return requireRole(['coordenador', 'admin']);
}

export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(['admin']);
}

export async function requireMedico(): Promise<AuthResult> {
  return requireRole(['medico']);
}
