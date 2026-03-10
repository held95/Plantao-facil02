import type { Plantao } from '@plantao/shared';
import type { NotificationEvent, NotificationRecipient, DeliveryLog } from './types';
import { awsSesService } from './email/awsSesService';
import { twilioSmsService } from './sms/twilioSmsService';
import { expoPushService } from './push/expoPushService';
import crypto from 'crypto';

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
