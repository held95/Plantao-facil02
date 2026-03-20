import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireCoordinator, documentRepository, documentStorage, plantaoRepository, authUserRepository, logRepository } from '@plantao/backend';
import type { PlantaoDocumento, PlantaoDocumentoComLeitura } from '@plantao/shared';
import { dispatchDocumentoCriado } from '@plantao/notifications';
import type { NotificationRecipient } from '@plantao/notifications';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// GET /api/plantoes/[id]/documentos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id: plantaoId } = await params;
    const userId = session.user.id as string;

    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get('q') || undefined,
      desde: searchParams.get('desde') || undefined,
      ate: searchParams.get('ate') || undefined,
      includeArchived: searchParams.get('includeArchived') === 'true',
    };

    const docs = await documentRepository.listByPlantaoId(plantaoId, filters);
    const readMap = await documentRepository.getReadStatusBatch(docs.map((d) => d.id), userId);

    const result: PlantaoDocumentoComLeitura[] = docs.map((d) => ({
      ...d,
      lido: readMap.has(d.id),
      visualizadoAt: readMap.get(d.id)?.visualizadoAt,
    }));

    return NextResponse.json({ documentos: result });
  } catch (error) {
    console.error('[documentos/GET]', error);
    return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
  }
}

// POST /api/plantoes/[id]/documentos
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const { id: plantaoId } = await params;

    const formData = await request.formData();
    const file = formData.get('arquivo') as File | null;
    const titulo = formData.get('titulo') as string | null;
    const descricao = formData.get('descricao') as string | null;

    if (!file || !titulo) {
      return NextResponse.json({ error: 'Arquivo e título são obrigatórios' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF são aceitos' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 20MB.' }, { status: 400 });
    }

    const documentId = crypto.randomUUID();
    const s3Key = documentStorage.buildDocumentKey(documentId, file.name);

    await documentStorage.uploadBuffer(s3Key, buffer, file.type);

    const doc: PlantaoDocumento = {
      id: documentId,
      plantaoId,
      titulo: titulo.trim(),
      descricao: descricao?.trim() || undefined,
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

    await documentRepository.createDocument(doc);

    // Audit log
    logRepository.createLogEntry({
      userId: session.user.id as string,
      action: 'UPLOAD_DOCUMENTO',
      entityType: 'DOCUMENTO',
      entityId: documentId,
      details: { plantaoId, titulo: doc.titulo, fileName: doc.fileName },
    }).catch(console.error);

    // Fire-and-forget: notify inscribed doctors if email notifications enabled
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      (async () => {
        try {
          const allPlantoes = await plantaoRepository.listPlantoes();
          const plantao = allPlantoes.find((p) => p.id === plantaoId);
          if (plantao) {
            const allUsers = await authUserRepository.listAllActiveUsers();
            const medicosInscritos = allUsers.filter((u) => u.role === 'medico');
            const recipients: NotificationRecipient[] = medicosInscritos.map((u) => ({
              userId: u.id,
              nome: u.nome,
              email: u.email,
              phone: u.telefone,
              pushTokens: u.pushTokens || [],
              smsEnabled: true,
              emailEnabled: true,
              pushEnabled: !!(u.pushTokens && u.pushTokens.length > 0),
            }));
            await dispatchDocumentoCriado(doc, recipients);
          }
        } catch (err) {
          console.error('[documentos/POST] notification dispatch error:', err);
        }
      })().catch(console.error);
    }

    const downloadUrl =
      (await documentStorage.getPresignedDownloadUrl(s3Key)) ??
      `/api/documentos/${documentId}/download`;

    return NextResponse.json({ documento: doc, downloadUrl }, { status: 201 });
  } catch (error) {
    console.error('[documentos/POST]', error);
    return NextResponse.json({ error: 'Erro ao fazer upload do documento' }, { status: 500 });
  }
}
