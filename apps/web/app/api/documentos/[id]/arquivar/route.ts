import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator, documentRepository } from '@plantao/backend';

// PATCH /api/documentos/[id]/arquivar
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireCoordinator();
    if (error) return error;

    const { id } = await params;

    const doc = await documentRepository.getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 });
    }

    if (doc.status === 'arquivado') {
      return NextResponse.json({ error: 'Documento ja esta arquivado' }, { status: 400 });
    }

    const archived = await documentRepository.archiveDocument(id);
    return NextResponse.json({ documento: archived });
  } catch (err) {
    console.error('[documentos/arquivar/PATCH]', err);
    return NextResponse.json({ error: 'Erro ao arquivar documento' }, { status: 500 });
  }
}
