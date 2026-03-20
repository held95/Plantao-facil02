import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, documentRepository, logRepository } from '@plantao/backend';

// POST /api/documentos/[id]/visualizado
export async function POST(
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

    const read = await documentRepository.markAsRead(id, userId);

    // Audit log
    logRepository.createLogEntry({
      userId,
      action: 'VISUALIZAR_DOCUMENTO',
      entityType: 'DOCUMENTO',
      entityId: id,
    }).catch(console.error);

    return NextResponse.json({ success: true, visualizadoAt: read.visualizadoAt });
  } catch (error) {
    console.error('[documentos/visualizado/POST]', error);
    return NextResponse.json({ error: 'Erro ao marcar documento como lido' }, { status: 500 });
  }
}
