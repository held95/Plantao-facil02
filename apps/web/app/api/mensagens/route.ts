import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@plantao/backend';
import { messageRepository, authUserRepository } from '@plantao/backend';
import { dispatchMensagemRecebida } from '@plantao/notifications';
import type { NotificationRecipient } from '@plantao/notifications';

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session.user.id as string;
  const [recebidas, enviadas] = await Promise.all([
    messageRepository.listInbox(userId),
    messageRepository.listSent(userId),
  ]);

  return NextResponse.json({ recebidas, enviadas });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const toUserId = formData.get('toUserId') as string;
    const assunto = formData.get('assunto') as string;
    const corpo = formData.get('corpo') as string;
    const arquivo = formData.get('arquivo') as File | null;
    const sendSms = formData.get('sendSms') === 'true';

    if (!toUserId || !assunto || !corpo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: toUserId, assunto, corpo' },
        { status: 400 }
      );
    }

    const destinatario = await authUserRepository.findById(toUserId);
    if (!destinatario) {
      return NextResponse.json({ error: 'Destinatário não encontrado' }, { status: 404 });
    }

    let anexo: { nome: string; tamanhoBytes: number; mimeType: string; dados: string } | undefined;
    if (arquivo && arquivo.size > 0) {
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      anexo = {
        nome: arquivo.name,
        tamanhoBytes: arquivo.size,
        mimeType: arquivo.type || 'application/octet-stream',
        dados: buffer.toString('base64'),
      };
    }

    const mensagem = await messageRepository.create({
      fromUserId: session.user.id as string,
      fromNome: session.user.name as string,
      toUserId,
      toNome: destinatario.nome,
      assunto,
      corpo,
      ...(anexo ? { anexo } : {}),
    });

    // Fire-and-forget: dispatch runs after response is returned
    void (async () => {
      try {
        const recipient: NotificationRecipient = {
          userId: destinatario.id,
          nome: destinatario.nome,
          email: destinatario.email,
          phone: destinatario.telefone,
          pushTokens: [],
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: false,
        };
        const logs = await dispatchMensagemRecebida(mensagem, recipient, sendSms);
        const failed = logs.filter((l) => l.status === 'failed');
        if (failed.length > 0) {
          console.warn(`[mensagens/route] ${failed.length} notification(s) failed`);
        }
      } catch (err) {
        console.error('[mensagens/route] Erro ao despachar notificacoes:', err);
      }
    })();

    return NextResponse.json({ mensagem }, { status: 201 });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
