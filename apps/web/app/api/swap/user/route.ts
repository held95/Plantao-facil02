import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, swapRepository } from '@plantao/backend';

// GET /api/swap/user — list swaps for the current user
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = session.user.id as string;
    const swaps = await swapRepository.listByUserId(userId);

    return NextResponse.json({ swaps });
  } catch (err) {
    console.error('[swap/user/GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar trocas' }, { status: 500 });
  }
}
