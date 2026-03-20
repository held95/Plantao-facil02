import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, documentRepository } from '@plantao/backend';

// GET /api/documentos/[id]/versoes — list version history of a document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const versoes = await documentRepository.listVersionsByParentId(id);

    return NextResponse.json({ versoes });
  } catch (err) {
    console.error('[documentos/versoes/GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar versoes' }, { status: 500 });
  }
}
