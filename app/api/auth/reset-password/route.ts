import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authUserRepository } from '@/lib/aws/dynamo/authRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = (body?.token || '').trim();
    const novaSenha = body?.novaSenha || '';

    if (!token || !novaSenha) {
      return NextResponse.json(
        { error: 'Token e nova senha sao obrigatorios.' },
        { status: 400 }
      );
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const userId = await authUserRepository.consumeValidPasswordResetToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Token invalido, expirado ou ja utilizado.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(novaSenha, 10);
    const updated = await authUserRepository.updatePassword(userId, passwordHash);
    if (!updated) {
      return NextResponse.json(
        { error: 'Nao foi possivel atualizar a senha.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso.',
    });
  } catch (error) {
    console.error('Erro em reset-password:', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir senha.' },
      { status: 500 }
    );
  }
}

