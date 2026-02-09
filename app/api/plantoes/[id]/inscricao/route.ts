import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mockPlantoes } from '@/lib/data/mockPlantoes';

// POST /api/plantoes/[id]/inscricao - Register for a plantão
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check authentication
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check role - only doctors can register for plantões
    if (session.user?.role !== 'medico') {
      return NextResponse.json(
        { error: 'Apenas médicos podem se inscrever em plantões' },
        { status: 403 }
      );
    }

    const { id: plantaoId } = await params;

    // Find plantão (in production, fetch from database)
    // For now, check mock data
    const plantao = mockPlantoes.find((p) => p.id === plantaoId);

    if (!plantao) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      );
    }

    // Check availability
    if (plantao.status !== 'disponivel') {
      return NextResponse.json(
        { error: 'Este plantão não está disponível' },
        { status: 400 }
      );
    }

    if (plantao.vagasDisponiveis <= 0) {
      return NextResponse.json(
        { error: 'Não há vagas disponíveis para este plantão' },
        { status: 400 }
      );
    }

    // In production:
    // - Check if doctor already registered
    // - Save inscription to database
    // - Update vagasDisponiveis
    // - Create notification

    // Email notifications disabled for stability
    console.log('📧 Email notifications disabled - inscription successful');

    return NextResponse.json(
      {
        success: true,
        message: 'Inscrição realizada com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating inscription:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    );
  }
}
