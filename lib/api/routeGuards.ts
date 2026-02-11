import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types/user';

/**
 * Route Guard Utilities for API Protection
 *
 * These utilities provide consistent authentication and authorization
 * checks across all API routes. They follow the principle of defense
 * in depth - always verify permissions on the backend.
 */

export interface AuthResult {
  session: any | null;
  error: NextResponse | null;
}

/**
 * Require authentication for an API route
 * Returns session if authenticated, or error response if not
 *
 * @example
 * const { session, error } = await requireAuth();
 * if (error) return error;
 */
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

/**
 * Require specific role(s) for an API route
 * Checks if user has one of the allowed roles
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @example
 * const { session, error } = await requireRole(['coordenador', 'admin']);
 * if (error) return error;
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  // First check authentication
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  // Check role
  const userRole = session?.user?.role as UserRole;
  if (!allowedRoles.includes(userRole)) {
    return {
      session: null,
      error: NextResponse.json(
        {
          error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
          requiredRoles: allowedRoles,
          userRole: userRole,
        },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Convenience function to require coordinator or admin role
 * Most restricted pages/APIs use this check
 *
 * @example
 * const { session, error } = await requireCoordinator();
 * if (error) return error;
 */
export async function requireCoordinator(): Promise<AuthResult> {
  return requireRole(['coordenador', 'admin']);
}

/**
 * Convenience function to require admin role only
 * Use for highly sensitive operations
 *
 * @example
 * const { session, error } = await requireAdmin();
 * if (error) return error;
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(['admin']);
}

/**
 * Convenience function to require medico (doctor) role
 * Use for doctor-specific features
 *
 * @example
 * const { session, error } = await requireMedico();
 * if (error) return error;
 */
export async function requireMedico(): Promise<AuthResult> {
  return requireRole(['medico']);
}
