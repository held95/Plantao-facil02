import twilio from 'twilio';
import type { Plantao } from '@plantao/shared';
import type { SendSMSResult } from '@plantao/shared';
import { formatToBrazilianE164, validateBrazilianPhone } from '@plantao/shared';
import { getPlantaoCriadoMessage, getInscricaoConfirmadaMessage } from './templates';

const SMS_ENABLED = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export const twilioSmsService = {
  async sendPlantaoCriadoSMS(
    phone: string,
    nome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    if (!SMS_ENABLED) {
      console.log('[twilioSmsService] SMS notifications disabled. Skipping.');
      return { success: false, error: 'SMS_DISABLED' };
    }

    const client = getTwilioClient();
    if (!client) {
      console.warn('[twilioSmsService] Twilio credentials not configured.');
      return { success: false, error: 'Twilio credentials not configured' };
    }

    if (!validateBrazilianPhone(phone)) {
      console.warn(`[twilioSmsService] Invalid phone number: ${phone}`);
      return { success: false, error: 'Invalid phone number format' };
    }

    const toPhone = formatToBrazilianE164(phone);
    if (!toPhone) {
      return { success: false, error: 'Failed to format phone number' };
    }

    const template = getPlantaoCriadoMessage(plantao);

    try {
      const msg = await client.messages.create({
        body: template.body,
        from: process.env.TWILIO_FROM_NUMBER!,
        to: toPhone,
      });
      console.log(`[twilioSmsService] SMS sent: ${msg.sid}`);
      return { success: true, messageId: msg.sid };
    } catch (err: any) {
      console.error('[twilioSmsService] Error sending SMS:', err.message);
      return { success: false, error: err.message };
    }
  },

  async sendInscricaoConfirmadaSMS(
    phone: string,
    nome: string,
    plantao: Plantao
  ): Promise<SendSMSResult> {
    if (!SMS_ENABLED) {
      return { success: false, error: 'SMS_DISABLED' };
    }

    const client = getTwilioClient();
    if (!client) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    if (!validateBrazilianPhone(phone)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const toPhone = formatToBrazilianE164(phone);
    if (!toPhone) {
      return { success: false, error: 'Failed to format phone number' };
    }

    const template = getInscricaoConfirmadaMessage(nome, plantao);

    try {
      const msg = await client.messages.create({
        body: template.body,
        from: process.env.TWILIO_FROM_NUMBER!,
        to: toPhone,
      });
      console.log(`[twilioSmsService] Inscricao SMS sent: ${msg.sid}`);
      return { success: true, messageId: msg.sid };
    } catch (err: any) {
      console.error('[twilioSmsService] Error sending SMS:', err.message);
      return { success: false, error: err.message };
    }
  },

  async sendCustomSMS(phone: string, body: string): Promise<SendSMSResult> {
    if (!SMS_ENABLED) {
      return { success: false, error: 'SMS_DISABLED' };
    }

    const client = getTwilioClient();
    if (!client) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    if (!validateBrazilianPhone(phone)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const toPhone = formatToBrazilianE164(phone);
    if (!toPhone) {
      return { success: false, error: 'Failed to format phone number' };
    }

    try {
      const msg = await client.messages.create({
        body,
        from: process.env.TWILIO_FROM_NUMBER!,
        to: toPhone,
      });
      console.log(`[twilioSmsService] Custom SMS sent: ${msg.sid}`);
      return { success: true, messageId: msg.sid };
    } catch (err: any) {
      console.error('[twilioSmsService] Error sending custom SMS:', err.message);
      return { success: false, error: err.message };
    }
  },
};
