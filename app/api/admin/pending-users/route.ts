import { NextResponse } from 'next/server';
import { requireCoordinator } from '@/lib/api/routeGuards';
import { authUserRepository } from '@/lib/aws/dynamo/authRepository';

export async function GET() {
  try {
    const { error } = await requireCoordinator();
    if (error) return error;

    const users = await authUserRepository.listPendingUsers();
    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Erro ao buscar usuarios pendentes:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar usuarios pendentes.' },
      { status: 500 }
    );
  }
}

