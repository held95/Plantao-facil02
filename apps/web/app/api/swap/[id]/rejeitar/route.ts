import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, swapRepository } from '@plantao/backend';

// POST /api/swap/[id]/rejeitar
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const userId = session.user.id as string;

    const swap = await swapRepository.getById(id);
    if (!swap) {
      return NextResponse.json({ error: 'Solicitacao de troca nao encontrada' }, { status: 404 });
    }

    if (swap.destinatarioId !== userId && swap.solicitanteId !== userId) {
      return NextResponse.json(
        { error: 'Apenas os participantes podem rejeitar esta troca' },
        { status: 403 }
      );
    }

    if (swap.status !== 'pendente') {
      return NextResponse.json(
        { error: 'Esta solicitacao nao esta mais pendente' },
        { status: 400 }
      );
    }

    const updated = await swapRepository.updateStatus(id, 'rejeitado', new Date().toISOString());

    return NextResponse.json({ swap: updated });
  } catch (err) {
    console.error('[swap/rejeitar/POST]', err);
    return NextResponse.json({ error: 'Erro ao rejeitar troca' }, { status: 500 });
  }
}
