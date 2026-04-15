import type { Plantao, PlantaoDocumento } from '@plantao/shared';
import type { NotificationEvent, NotificationRecipient, DeliveryLog } from './types';
import { awsSesService } from './email/awsSesService';
import { twilioSmsService } from './sms/twilioSmsService';
import { expoPushService } from './push/expoPushService';
import crypto from 'crypto';

// Minimal message payload — avoids importing Mensagem from @plantao/backend (circular dep)
interface MensagemPayload {
  id: string;
  fromNome: string;
  assunto: string;
  corpo: string;
}

async function makeLog(
  userId: string,
  event: NotificationEvent,
  channel: DeliveryLog['channel'],
  result: { messageId?: string; error?: string }
): Promise<DeliveryLog> {
  return {
    id: crypto.randomUUID(),
    userId,
    event,
    channel,
    status: result.error ? 'failed' : 'sent',
    providerMessageId: result.messageId,
    errorMessage: result.error,
    createdAt: new Date().toISOString(),
  };
}

export async function dispatchPlantaoCreated(
  plantao: Plantao,
  recipients: NotificationRecipient[]
): Promise<DeliveryLog[]> {
  const logs: DeliveryLog[] = [];

  for (const r of recipients) {
    // SMS
    if (r.smsEnabled && r.phone) {
      try {
        const res = await twilioSmsService.sendPlantaoCriadoSMS(r.phone, r.nome, plantao);
        logs.push(await makeLog(r.userId, 'PLANTAO_CREATED', 'sms', {
          messageId: res.messageId,
          error: res.success ? undefined : res.error,
        }));
      } catch (err: any) {
        logs.push(await makeLog(r.userId, 'PLANTAO_CREATED', 'sms', { error: err.message }));
      }
    }

    // Email
    if (r.emailEnabled && r.email) {
      try {
        const res = await awsSesService.sendPlantaoCriadoEmail(r.email, r.nome, plantao);
        logs.push(await makeLog(r.userId, 'PLANTAO_CREATED', 'email', {
          messageId: res.messageId,
          error: res.success ? undefined : res.error,
        }));
      } catch (err: any) {
        logs.push(await makeLog(r.userId, 'PLANTAO_CREATED', 'email', { error: err.message }));
      }
    }

    // Push
    if (r.pushEnabled && r.pushTokens?.length) {
      try {
        const results = await expoPushService.send(
          r.pushTokens,
          'Novo Plantão Disponível',
          `${plantao.especialidade} em ${plantao.hospital} — R$ ${plantao.valor}`,
          { plantaoId: plantao.id }
        );
        for (const res of results) {
          logs.push(await makeLog(r.userId, 'PLANTAO_CREATED', 'push', res));
        }
      } catch (err: any) {
        logs.push(await makeLog(r.userId, 'PLANTAO_CREATED', 'push', { error: err.message }));
      }
    }
  }

  return logs;
}

export async function dispatchDocumentoCriado(
  documento: PlantaoDocumento,
  recipients: NotificationRecipient[]
): Promise<DeliveryLog[]> {
  const logs: DeliveryLog[] = [];

  for (const r of recipients) {
    // SMS
    if (r.smsEnabled && r.phone) {
      try {
        const { getDocumentoCriadoMessage } = await import('./sms/templates');
        const template = getDocumentoCriadoMessage({
          medicoNome: r.nome,
          plantaoHospital: documento.plantaoId,
          documentoTitulo: documento.titulo,
        });
        const res = await twilioSmsService.sendCustomSMS(r.phone, template.body);
        logs.push(await makeLog(r.userId, 'DOCUMENTO_CRIADO', 'sms', {
          messageId: res.messageId,
          error: res.success ? undefined : res.error,
        }));
      } catch (err: any) {
        logs.push(await makeLog(r.userId, 'DOCUMENTO_CRIADO', 'sms', { error: err.message }));
      }
    }

    // Email
    if (r.emailEnabled && r.email) {
      try {
        const appUrl = process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'https://plantaofacil.com';
        const plantaoUrl = `${appUrl}/plantoes/${documento.plantaoId}?tab=documentos`;
        const res = await awsSesService.sendDocumentoCriadoEmail(
          r.email,
          r.nome,
          documento.uploadedByNome || 'Coordenador',
          documento.plantaoId,
          documento.titulo,
          plantaoUrl
        );
        logs.push(await makeLog(r.userId, 'DOCUMENTO_CRIADO', 'email', {
          messageId: res.messageId,
          error: res.success ? undefined : res.error,
        }));
      } catch (err: any) {
        logs.push(await makeLog(r.userId, 'DOCUMENTO_CRIADO', 'email', { error: err.message }));
      }
    }

    // Push
    if (r.pushEnabled && r.pushTokens?.length) {
      try {
        const results = await expoPushService.send(
          r.pushTokens,
          'Novo Documento Disponivel',
          `${documento.titulo} — acesse o plantao para visualizar`,
          { plantaoId: documento.plantaoId, documentoId: documento.id }
        );
        for (const res of results) {
          logs.push(await makeLog(r.userId, 'DOCUMENTO_CRIADO', 'push', res));
        }
      } catch (err: any) {
        logs.push(await makeLog(r.userId, 'DOCUMENTO_CRIADO', 'push', { error: err.message }));
      }
    }
  }

  return logs;
}

export async function dispatchSwapProposto(
  swapId: string,
  recipients: NotificationRecipient[]
): Promise<DeliveryLog[]> {
  console.log('[dispatchSwapProposto] stub — swapId:', swapId, 'recipients:', recipients.length);
  return [];
}

export async function dispatchSwapAceito(
  swapId: string,
  recipients: NotificationRecipient[]
): Promise<DeliveryLog[]> {
  console.log('[dispatchSwapAceito] stub — swapId:', swapId, 'recipients:', recipients.length);
  return [];
}

export async function dispatchSwapRejeitado(
  swapId: string,
  recipients: NotificationRecipient[]
): Promise<DeliveryLog[]> {
  console.log('[dispatchSwapRejeitado] stub — swapId:', swapId, 'recipients:', recipients.length);
  return [];
}

export async function dispatchMensagemRecebida(
  mensagem: MensagemPayload,
  recipient: NotificationRecipient,
  smsEnabled: boolean
): Promise<DeliveryLog[]> {
  const logs: DeliveryLog[] = [];
  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'https://plantaofacil.com';
  const mensagensUrl = `${appUrl}/mensagens`;

  // Email — always send if recipient has an email (direct messages bypass bulk opt-out)
  if (recipient.email) {
    try {
      const res = await awsSesService.sendNovaMensagemEmail(
        recipient.email,
        recipient.nome,
        mensagem.fromNome,
        mensagem.assunto,
        mensagem.corpo,
        mensagensUrl
      );
      logs.push(await makeLog(recipient.userId, 'MENSAGEM_RECEBIDA', 'email', {
        messageId: res.messageId,
        error: res.success ? undefined : res.error,
      }));
    } catch (err: any) {
      logs.push(await makeLog(recipient.userId, 'MENSAGEM_RECEBIDA', 'email', { error: err.message }));
    }
  }

  // SMS — only if sender opted in AND recipient has a phone number
  if (smsEnabled && recipient.phone) {
    try {
      const { getMensagemRecebidaMessage } = await import('./sms/templates');
      const template = getMensagemRecebidaMessage({
        recipientNome: recipient.nome,
        senderNome: mensagem.fromNome,
        assunto: mensagem.assunto,
      });
      const res = await twilioSmsService.sendCustomSMS(recipient.phone, template.body);
      logs.push(await makeLog(recipient.userId, 'MENSAGEM_RECEBIDA', 'sms', {
        messageId: res.messageId,
        error: res.success ? undefined : res.error,
      }));
    } catch (err: any) {
      logs.push(await makeLog(recipient.userId, 'MENSAGEM_RECEBIDA', 'sms', { error: err.message }));
    }
  }

  return logs;
}
