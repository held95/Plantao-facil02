import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator, documentRepository, documentStorage } from '@plantao/backend';
import type { PlantaoDocumento } from '@plantao/shared';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// POST /api/documentos/[id]/versao — upload a new version of a document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const { id: parentId } = await params;

    const parent = await documentRepository.getDocumentById(parentId);
    if (!parent) {
      return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('arquivo') as File | null;
    const titulo = (formData.get('titulo') as string | null) ?? parent.titulo;
    const descricao = formData.get('descricao') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo e obrigatorio' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF sao aceitos' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Maximo 20MB.' }, { status: 400 });
    }

    const documentId = crypto.randomUUID();
    const s3Key = documentStorage.buildDocumentKey(documentId, file.name);
    await documentStorage.uploadBuffer(s3Key, buffer, file.type);

    const newDoc: PlantaoDocumento = {
      id: documentId,
      plantaoId: parent.plantaoId,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || parent.descricao,
      fileName: file.name,
      s3Key,
      s3Bucket: process.env.AWS_S3_DOCUMENTS_BUCKET || 'mock-bucket',
      mimeType: file.type,
      tamanhoBytes: buffer.length,
      uploadedBy: session.user.id as string,
      uploadedByNome: session.user.name as string | undefined,
      uploadedAt: new Date().toISOString(),
      status: 'ativo',
    };

    const { newVersion, oldDoc } = await documentRepository.createVersion(parentId, newDoc);

    const downloadUrl =
      (await documentStorage.getPresignedDownloadUrl(s3Key)) ??
      `/api/documentos/${documentId}/download`;

    return NextResponse.json({ documento: newVersion, downloadUrl, versaoAnterior: oldDoc }, { status: 201 });
  } catch (err) {
    console.error('[documentos/versao/POST]', err);
    return NextResponse.json({ error: 'Erro ao criar nova versao' }, { status: 500 });
  }
}
