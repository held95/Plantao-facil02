import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import type { Plantao } from '@plantao/shared';
import type { SendSMSResult } from '@plantao/shared';
import {
  getPlantaoCriadoMessage,
  getInscricaoConfirmadaMessage,
  getLembrete24hMessage,
  getLembrete1hMessage,
} from './templates';
import {
  formatToBrazilianE164,
  validateBrazilianPhone,
} from '@plantao/shared';

let snsClient: SNSClient | null = null;

function getSNSClient(): SNSClient | null {
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  if (!snsClient) {
    try {
      snsClient = new SNSClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } catch (error) {
      console.error('Failed to initialize AWS SNS client:', error);
      return null;
    }
  }

  return snsClient;
}

const SMS_ENABLED = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';

export const awsSnsService = {
  async sendPlantaoCriadoSMS(
    coordenadorPhone: string,
    coordenadorNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    if (!SMS_ENABLED) {
      console.log('[awsSnsService] SMS notifications disabled. Skipping SMS send.');
      return { success: true };
    }

    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('[awsSnsService] AWS credentials not configured. SMS not sent.');
      return { success: false, error: 'AWS credentials not configured' };
    }

    if (!validateBrazilianPhone(coordenadorPhone)) {
      console.warn(`[awsSnsService] Invalid phone number: ${coordenadorPhone}`);
      return { success: false, error: 'Invalid phone number format' };
    }

    try {
      const client = getSNSClient();
      if (!client) {
        return { success: false, error: 'Failed to initialize AWS SNS client' };
      }

      const toPhone = formatToBrazilianE164(coordenadorPhone);
      if (!toPhone) {
        return { success: false, error: 'Failed to format phone number' };
      }

      const template = getPlantaoCriadoMessage(plantao);

      if (template.isMultiPart) {
        console.warn(`[awsSnsService] SMS is multi-part (${template.length} chars). Will cost multiple SMS credits.`);
      }

      const command = new PublishCommand({
        PhoneNumber: toPhone,
        Message: template.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });

      const response = await client.send(command);
      console.log(`[awsSnsService] SMS sent: ${response.MessageId}`);
      return { success: true, messageId: response.MessageId };
    } catch (error: any) {
      console.error('[awsSnsService] Error sending SMS:', error);
      return { success: false, error: error.message, errorCode: error.code };
    }
  },

  async sendInscricaoConfirmadaSMS(
    medicoPhone: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    if (!SMS_ENABLED) {
      return { success: true };
    }

    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return { success: false, error: 'AWS credentials not configured' };
    }

    if (!validateBrazilianPhone(medicoPhone)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    try {
      const client = getSNSClient();
      if (!client) {
        return { success: false, error: 'Failed to initialize AWS SNS client' };
      }

      const toPhone = formatToBrazilianE164(medicoPhone);
      if (!toPhone) {
        return { success: false, error: 'Failed to format phone number' };
      }

      const template = getInscricaoConfirmadaMessage(medicoNome, plantao);

      const command = new PublishCommand({
        PhoneNumber: toPhone,
        Message: template.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });

      const response = await client.send(command);
      return { success: true, messageId: response.MessageId };
    } catch (error: any) {
      console.error('[awsSnsService] Error sending SMS:', error);
      return { success: false, error: error.message, errorCode: error.code };
    }
  },

  async sendPlantaoCriadoSMSToAll(
    phones: string[],
    plantao: Plantao
  ): Promise<{ sent: number; failed: number }> {
    const result = { sent: 0, failed: 0 };

    if (!SMS_ENABLED || phones.length === 0) {
      return result;
    }

    for (const phone of phones) {
      const singleResult = await this.sendPlantaoCriadoSMS(phone, '', plantao);
      if (singleResult.success) result.sent++;
      else result.failed++;
    }

    return result;
  },

  async sendLembrete24h(
    medicoPhone: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    return { success: true };
  },

  async sendLembrete1h(
    medicoPhone: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    return { success: true };
  },
};
