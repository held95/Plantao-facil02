import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authUserRepository } from '@/lib/aws/dynamo/authRepository';
import { awsSesService } from '@/lib/email/awsSesService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').trim().toLowerCase();
    const senha = body?.senha || '';

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha sao obrigatorios.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalido.' }, { status: 400 });
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const existingUser = await authUserRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ja esta cadastrado.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(senha, 10);
    await authUserRepository.createPendingUser({
      email,
      passwordHash,
    });

    const emailResult = await awsSesService.sendCadastroRecebidoEmail(email);
    if (!emailResult.success) {
      console.warn('[register] Could not send cadastro recebido email:', emailResult.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cadastro recebido e pendente de aprovacao.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar conta.' },
      { status: 500 }
    );
  }
}

