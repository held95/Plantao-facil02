import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, documentRepository, documentStorage } from '@plantao/backend';

// GET /api/documentos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const userId = session.user.id as string;

    const doc = await documentRepository.getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    const downloadUrl =
      (await documentStorage.getPresignedDownloadUrl(doc.s3Key)) ??
      `/api/documentos/${id}/download`;

    const readStatus = await documentRepository.getReadStatus(id, userId);

    return NextResponse.json({
      documento: doc,
      downloadUrl,
      lido: !!readStatus,
      visualizadoAt: readStatus?.visualizadoAt ?? null,
    });
  } catch (error) {
    console.error('[documentos/[id]/GET]', error);
    return NextResponse.json({ error: 'Erro ao buscar documento' }, { status: 500 });
  }
}
