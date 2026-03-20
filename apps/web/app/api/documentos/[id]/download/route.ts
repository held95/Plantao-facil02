import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, documentRepository } from '@plantao/backend';

// GET /api/documentos/[id]/download — fallback para mock mode (S3 não configurado)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const doc = await documentRepository.getDocumentById(id);

  if (!doc) {
    return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
  }

  // Em mock mode, retorna mensagem informativa
  return new NextResponse(
    `PDF não disponível em modo de desenvolvimento.\nDocumento: ${doc.titulo}\nArquivo: ${doc.fileName}`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    }
  );
}
