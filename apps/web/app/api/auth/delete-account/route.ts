import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, authUserRepository } from '@plantao/backend';

// DELETE /api/auth/delete-account — anonymize user data (LGPD right to erasure)
export async function DELETE(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = session.user.id as string;

    await authUserRepository.deleteUserData(userId);

    return NextResponse.json({ success: true, message: 'Dados anonimizados com sucesso.' });
  } catch (err) {
    console.error('[delete-account/DELETE]', err);
    return NextResponse.json({ error: 'Erro ao anonimizar dados do usuario' }, { status: 500 });
  }
}
