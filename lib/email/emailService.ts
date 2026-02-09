import { Resend } from 'resend';
import { Plantao } from '@/types/plantao';
import { render } from '@react-email/render';
import PlantaoCriadoEmail from '@/emails/PlantaoCriadoEmail';
import InscricaoConfirmadaEmail from '@/emails/InscricaoConfirmadaEmail';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const REPLY_TO = process.env.RESEND_REPLY_TO || 'suporte@plantaofacil.com';
const EMAIL_ENABLED = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const emailService = {
  /**
   * Send email when coordinator creates a plantão
   */
  async sendPlantaoCriadoEmail(
    coordenadorEmail: string,
    coordenadorNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    if (!EMAIL_ENABLED) {
      console.log('📧 Email notifications disabled. Skipping email send.');
      return { success: true };
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return {
        success: false,
        error: 'RESEND_API_KEY not configured',
      };
    }

    try {
      const plantaoUrl = `${process.env.NEXTAUTH_URL}/plantoes/${plantao.id}`;

      const emailHtml = await render(
        PlantaoCriadoEmail({
          coordenadorNome,
          plantao,
          plantaoUrl,
        })
      );

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: coordenadorEmail,
        replyTo: REPLY_TO,
        subject: `Plantão Criado - ${plantao.hospital}`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent successfully:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send email when doctor registers for a plantão
   */
  async sendInscricaoConfirmadaEmail(
    medicoEmail: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    if (!EMAIL_ENABLED) {
      console.log('📧 Email notifications disabled. Skipping email send.');
      return { success: true };
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return {
        success: false,
        error: 'RESEND_API_KEY not configured',
      };
    }

    try {
      const plantaoUrl = `${process.env.NEXTAUTH_URL}/inscricoes`;

      const emailHtml = await render(
        InscricaoConfirmadaEmail({
          medicoNome,
          plantao,
          plantaoUrl,
        })
      );

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: medicoEmail,
        replyTo: REPLY_TO,
        subject: `Inscrição Confirmada - ${plantao.hospital}`,
        html: emailHtml,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent successfully:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send reminder email 24 hours before plantão
   */
  async sendLembrete24h(
    medicoEmail: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    // Placeholder for future implementation
    console.log('📧 Lembrete 24h: Feature coming soon');
    return { success: true };
  },

  /**
   * Send reminder email 1 hour before plantão
   */
  async sendLembrete1h(
    medicoEmail: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    // Placeholder for future implementation
    console.log('📧 Lembrete 1h: Feature coming soon');
    return { success: true };
  },
};
