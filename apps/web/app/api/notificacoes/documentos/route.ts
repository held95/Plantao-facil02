import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, documentRepository } from '@plantao/backend';
import type { DocumentNotificacao, DocumentNotificacaoResponse } from '@plantao/shared';

// GET /api/notificacoes/documentos?since=<ISO>
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const userId = session.user.id as string;

    const sinceParam = request.nextUrl.searchParams.get('since');
    const since =
      sinceParam ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const recentDocs = await documentRepository.listUploadedAfter(since);
    const readMap = await documentRepository.getReadStatusBatch(
      recentDocs.map((d) => d.id),
      userId
    );

    const recentes: DocumentNotificacao[] = recentDocs.map((d) => ({
      id: d.id,
      plantaoId: d.plantaoId,
      titulo: d.titulo,
      uploadedAt: d.uploadedAt,
      uploadedByNome: d.uploadedByNome,
      lido: readMap.has(d.id),
    }));

    // Ordena mais recentes primeiro
    recentes.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

    const unreadCount = recentes.filter((n) => !n.lido).length;

    const response: DocumentNotificacaoResponse = { unreadCount, recentes };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[notificacoes/documentos/GET]', error);
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
  }
}
