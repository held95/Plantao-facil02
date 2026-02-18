import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/data/mockUsers';
import { User } from '@/types/user';

// POST /api/auth/register — Criar nova conta de usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, senha, telefone, emailNotificacao, crm, especialidade } = body;

    // Validacao dos campos obrigatorios
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha sao obrigatorios.' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // Verificar duplicidade de email
    const emailExists = mockUsers.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return NextResponse.json(
        { error: 'Este email ja esta cadastrado.' },
        { status: 409 }
      );
    }

    // Criar novo usuario
    // Em producao: salvar no DynamoDB e aplicar bcrypt na senha
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      nome,
      email: email.toLowerCase(),
      emailNotificacao: emailNotificacao || undefined,
      telefone: telefone || undefined,
      crm: crm || undefined,
      especialidade: especialidade || undefined,
      role: 'medico', // Novos usuarios sao medicos por padrao
      ativo: true,
      preferenciasNotificacao: {
        novosPlantoes: true,
        meusPlantoes: true,
        lembrete24h: true,
        lembrete1h: true,
        alteracoes: true,
        email: true,
        app: true,
        frequenciaEmail: 'imediato',
        locaisInteresse: [],
      },
      createdAt: new Date().toISOString(),
    };

    // Adicionar ao array em memoria (MVP)
    mockUsers.push(newUser);

    console.log(`Novo usuario criado: ${nome} (${email})`);

    return NextResponse.json(
      {
        success: true,
        message: 'Conta criada com sucesso!',
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email,
          role: newUser.role,
        },
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
