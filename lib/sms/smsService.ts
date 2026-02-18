import twilio from 'twilio';
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
 * SMS Service using Twilio
 *
 * Mirrors the structure of emailService.ts for consistency.
 * Handles SMS notifications for plantão events.
 */

// Lazy initialization to prevent build-time errors
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient(): ReturnType<typeof twilio> | null {
  // Return null if no credentials - will be handled by calling functions
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  if (!twilioClient) {
    try {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (error) {
      console.error('Failed to initialize Twilio:', error);
      return null;
    }
  }

  return twilioClient;
}

// Configuration
const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER || '';
const SMS_ENABLED = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';

export const smsService = {
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

    // Check if credentials are configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !FROM_PHONE
    ) {
      console.warn('⚠️ Twilio credentials not configured. SMS not sent.');
      return {
        success: false,
        error: 'Twilio credentials not configured',
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
      // Get Twilio client
      const client = getTwilioClient();
      if (!client) {
        console.warn('⚠️ Failed to get Twilio client. SMS not sent.');
        return {
          success: false,
          error: 'Failed to initialize Twilio client',
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

      // Log if message is multi-part (will cost more)
      if (template.isMultiPart) {
        console.warn(
          `⚠️ SMS is multi-part (${template.length} chars). Will cost multiple SMS credits.`
        );
      }

      // Send SMS via Twilio
      const message = await client.messages.create({
        body: template.body,
        from: FROM_PHONE,
        to: toPhone,
      });

      console.log(`✅ SMS sent successfully: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);
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

    // Check if credentials are configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !FROM_PHONE
    ) {
      console.warn('⚠️ Twilio credentials not configured. SMS not sent.');
      return {
        success: false,
        error: 'Twilio credentials not configured',
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
      // Get Twilio client
      const client = getTwilioClient();
      if (!client) {
        console.warn('⚠️ Failed to get Twilio client. SMS not sent.');
        return {
          success: false,
          error: 'Failed to initialize Twilio client',
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

      // Send SMS via Twilio
      const message = await client.messages.create({
        body: template.body,
        from: FROM_PHONE,
        to: toPhone,
      });

      console.log(`✅ SMS sent successfully: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
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
