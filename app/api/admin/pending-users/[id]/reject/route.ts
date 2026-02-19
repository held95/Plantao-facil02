import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator } from '@/lib/api/routeGuards';
import { authUserRepository } from '@/lib/aws/dynamo/authRepository';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const { id } = await params;
    const approvedBy = session?.user?.id || 'system';
    const updatedUser = await authUserRepository.rejectUser(id, approvedBy);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Conta rejeitada com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao rejeitar usuario:', error);
    return NextResponse.json(
      { error: 'Erro interno ao rejeitar usuario.' },
      { status: 500 }
    );
  }
}

