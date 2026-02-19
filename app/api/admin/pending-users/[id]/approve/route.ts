import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator } from '@/lib/api/routeGuards';
import { authUserRepository } from '@/lib/aws/dynamo/authRepository';
import { awsSesService } from '@/lib/email/awsSesService';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const { id } = await params;
    const approvedBy = session?.user?.id || 'system';
    const updatedUser = await authUserRepository.approveUser(id, approvedBy);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado.' }, { status: 404 });
    }

    const emailResult = await awsSesService.sendContaAprovadaEmail(updatedUser.email);
    if (!emailResult.success) {
      console.warn('[approve-user] Could not send approved email:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Conta aprovada com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao aprovar usuario:', error);
    return NextResponse.json(
      { error: 'Erro interno ao aprovar usuario.' },
      { status: 500 }
    );
  }
}

