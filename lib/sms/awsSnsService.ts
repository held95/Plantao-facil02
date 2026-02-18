import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Plantao } from '@/types/plantao';
import type { SendSMSResult } from '@/types/sms';
import {
  getPlantaoCriadoMessage,
  getInscricaoConfirmadaMessage,
  getLembrete24hMessage,
  getLembrete1hMessage,
} from './templates';
import {
  formatToBrazilianE164,
  validateBrazilianPhone,
} from '@/lib/utils/phoneFormatter';

/**
 * AWS SNS SMS Service
 *
 * Replaces Twilio with AWS Simple Notification Service (SNS)
 * More integrated with AWS infrastructure and similar pricing
 */

// Lazy initialization to prevent build-time errors
let snsClient: SNSClient | null = null;

function getSNSClient(): SNSClient | null {
  // Return null if no credentials
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

// Configuration
const SMS_ENABLED = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';

export const awsSnsService = {
  /**
   * Send SMS when coordinator creates a plantão
   */
  async sendPlantaoCriadoSMS(
    coordenadorPhone: string,
    coordenadorNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    // Skip if SMS is disabled
    if (!SMS_ENABLED) {
      console.log('📱 SMS notifications disabled. Skipping SMS send.');
      return { success: true };
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ AWS credentials not configured. SMS not sent.');
      return {
        success: false,
        error: 'AWS credentials not configured',
      };
    }

    // Validate phone number
    if (!validateBrazilianPhone(coordenadorPhone)) {
      console.warn(`⚠️ Invalid phone number: ${coordenadorPhone}`);
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    try {
      // Get SNS client
      const client = getSNSClient();
      if (!client) {
        console.warn('⚠️ Failed to get AWS SNS client. SMS not sent.');
        return {
          success: false,
          error: 'Failed to initialize AWS SNS client',
        };
      }

      // Format phone number to E.164
      const toPhone = formatToBrazilianE164(coordenadorPhone);
      if (!toPhone) {
        return {
          success: false,
          error: 'Failed to format phone number',
        };
      }

      // Generate SMS message
      const template = getPlantaoCriadoMessage(plantao);

      // Log if message is multi-part
      if (template.isMultiPart) {
        console.warn(
          `⚠️ SMS is multi-part (${template.length} chars). Will cost multiple SMS credits.`
        );
      }

      // Send SMS via AWS SNS
      const command = new PublishCommand({
        PhoneNumber: toPhone,
        Message: template.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'PlantaoFacil', // Optional: Custom sender ID (max 11 chars)
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional', // Transactional messages have higher priority
          },
        },
      });

      const response = await client.send(command);

      console.log(`✅ SMS sent via AWS SNS: ${response.MessageId}`);
      return { success: true, messageId: response.MessageId };
    } catch (error: any) {
      console.error('❌ Error sending SMS via AWS SNS:', error);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  },

  /**
   * Send SMS when doctor registers for a plantão
   */
  async sendInscricaoConfirmadaSMS(
    medicoPhone: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    // Skip if SMS is disabled
    if (!SMS_ENABLED) {
      console.log('📱 SMS notifications disabled. Skipping SMS send.');
      return { success: true };
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ AWS credentials not configured. SMS not sent.');
      return {
        success: false,
        error: 'AWS credentials not configured',
      };
    }

    // Validate phone number
    if (!validateBrazilianPhone(medicoPhone)) {
      console.warn(`⚠️ Invalid phone number: ${medicoPhone}`);
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    try {
      // Get SNS client
      const client = getSNSClient();
      if (!client) {
        console.warn('⚠️ Failed to get AWS SNS client. SMS not sent.');
        return {
          success: false,
          error: 'Failed to initialize AWS SNS client',
        };
      }

      // Format phone number to E.164
      const toPhone = formatToBrazilianE164(medicoPhone);
      if (!toPhone) {
        return {
          success: false,
          error: 'Failed to format phone number',
        };
      }

      // Generate SMS message
      const template = getInscricaoConfirmadaMessage(medicoNome, plantao);

      // Send SMS via AWS SNS
      const command = new PublishCommand({
        PhoneNumber: toPhone,
        Message: template.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'PlantaoFacil',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });

      const response = await client.send(command);

      console.log(`✅ SMS sent via AWS SNS: ${response.MessageId}`);
      return { success: true, messageId: response.MessageId };
    } catch (error: any) {
      console.error('❌ Error sending SMS via AWS SNS:', error);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  },

  /**
   * Envia SMS de novo plantão para TODOS os usuários elegíveis (batch).
   * Custo-otimizado: deduplicação de números, respeitando opt-in.
   *
   * @param phones - Lista de telefones já no formato E.164
   * @param plantao - Dados do plantão criado
   */
  async sendPlantaoCriadoSMSToAll(
    phones: string[],
    plantao: Plantao
  ): Promise<{ sent: number; failed: number }> {
    const result = { sent: 0, failed: 0 };

    if (!SMS_ENABLED) {
      console.log('📱 SMS desabilitado (ENABLE_SMS_NOTIFICATIONS != true).');
      return result;
    }

    if (phones.length === 0) {
      console.log('📱 Nenhum usuário elegível para SMS.');
      return result;
    }

    const template = getPlantaoCriadoMessage(plantao);

    if (template.isMultiPart) {
      console.warn(`⚠️ SMS tem ${template.length} chars (>160) — custo extra. Verifique o template.`);
    }

    console.log(`📤 Enviando SMS para ${phones.length} usuário(s)...`);

    for (const phone of phones) {
      const singleResult = await this.sendPlantaoCriadoSMS(phone, '', plantao);
      if (singleResult.success) {
        result.sent++;
      } else {
        result.failed++;
      }
    }

    console.log(`📊 SMS enviados: ${result.sent} sucesso, ${result.failed} falha(s)`);
    return result;
  },

  /**
   * Send reminder SMS 24 hours before plantão
   */
  async sendLembrete24h(
    medicoPhone: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    // Placeholder for future implementation
    console.log('📱 Lembrete 24h: Feature coming soon');
    return { success: true };
  },

  /**
   * Send reminder SMS 1 hour before plantão
   */
  async sendLembrete1h(
    medicoPhone: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    // Placeholder for future implementation
    console.log('📱 Lembrete 1h: Feature coming soon');
    return { success: true };
  },
};
