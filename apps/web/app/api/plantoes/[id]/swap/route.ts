import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, swapRepository, authUserRepository } from '@plantao/backend';

// POST /api/plantoes/[id]/swap — create a swap request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id: plantaoOrigemId } = await params;
    const solicitanteId = session.user.id as string;
    const solicitanteNome = session.user.name as string;

    const body = await request.json();
    const { destinatarioId, plantaoDestinoId } = body;

    if (!destinatarioId || !plantaoDestinoId) {
      return NextResponse.json(
        { error: 'destinatarioId e plantaoDestinoId sao obrigatorios' },
        { status: 400 }
      );
    }

    const destinatario = await authUserRepository.findById(destinatarioId);
    if (!destinatario) {
      return NextResponse.json({ error: 'Destinatario nao encontrado' }, { status: 404 });
    }

    const swap = await swapRepository.createSwapRequest({
      solicitanteId,
      solicitanteNome,
      destinatarioId,
      destinatarioNome: destinatario.nome,
      plantaoOrigemId,
      plantaoDestinoId,
      status: 'pendente',
    });

    return NextResponse.json({ swap }, { status: 201 });
  } catch (err) {
    console.error('[swap/POST]', err);
    return NextResponse.json({ error: 'Erro ao criar solicitacao de troca' }, { status: 500 });
  }
}

// GET /api/plantoes/[id]/swap — list swaps related to the plantao
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { id: plantaoId } = await params;
    const swaps = await swapRepository.listByPlantaoId(plantaoId);

    return NextResponse.json({ swaps });
  } catch (err) {
    console.error('[swap/GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar trocas' }, { status: 500 });
  }
}
