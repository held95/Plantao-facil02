import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Plantao } from '@/types/plantao';
import { render } from '@react-email/render';
import PlantaoCriadoEmail from '@/emails/PlantaoCriadoEmail';
import InscricaoConfirmadaEmail from '@/emails/InscricaoConfirmadaEmail';

/**
 * AWS SES Email Service
 *
 * Replaces Resend with AWS Simple Email Service (SES)
 * More cost-effective and integrated with AWS infrastructure
 */

// Lazy initialization to prevent build-time errors
let sesClient: SESClient | null = null;

function getSESClient(): SESClient | null {
  // Return null if no credentials
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  if (!sesClient) {
    try {
      sesClient = new SESClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } catch (error) {
      console.error('Failed to initialize AWS SES client:', error);
      return null;
    }
  }

  return sesClient;
}

// Configuration
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'noreply@plantaofacil.com';
const REPLY_TO = process.env.AWS_SES_REPLY_TO || 'suporte@plantaofacil.com';
const EMAIL_ENABLED = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const awsSesService = {
  /**
   * Send email when coordinator creates a plantão
   */
  async sendPlantaoCriadoEmail(
    coordenadorEmail: string,
    coordenadorNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    // Skip if email is disabled
    if (!EMAIL_ENABLED) {
      console.log('📧 Email notifications disabled. Skipping email send.');
      return { success: true };
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ AWS credentials not configured. Email not sent.');
      return {
        success: false,
        error: 'AWS credentials not configured',
      };
    }

    try {
      // Get SES client
      const client = getSESClient();
      if (!client) {
        console.warn('⚠️ Failed to get AWS SES client. Email not sent.');
        return {
          success: false,
          error: 'Failed to initialize AWS SES client',
        };
      }

      const plantaoUrl = `${process.env.NEXTAUTH_URL}/plantoes/${plantao.id}`;

      // Render email template
      const emailHtml = await render(
        PlantaoCriadoEmail({
          coordenadorNome,
          plantao,
          plantaoUrl,
        })
      );

      // Send email via AWS SES
      const command = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
          ToAddresses: [coordenadorEmail],
        },
        Message: {
          Subject: {
            Data: `Plantão Criado - ${plantao.hospital}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: emailHtml,
              Charset: 'UTF-8',
            },
          },
        },
        ReplyToAddresses: [REPLY_TO],
      });

      const response = await client.send(command);

      console.log('✅ Email sent via AWS SES:', response.MessageId);
      return { success: true, messageId: response.MessageId };
    } catch (error: any) {
      console.error('❌ Error sending email via AWS SES:', error);
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
    // Skip if email is disabled
    if (!EMAIL_ENABLED) {
      console.log('📧 Email notifications disabled. Skipping email send.');
      return { success: true };
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ AWS credentials not configured. Email not sent.');
      return {
        success: false,
        error: 'AWS credentials not configured',
      };
    }

    try {
      // Get SES client
      const client = getSESClient();
      if (!client) {
        console.warn('⚠️ Failed to get AWS SES client. Email not sent.');
        return {
          success: false,
          error: 'Failed to initialize AWS SES client',
        };
      }

      const plantaoUrl = `${process.env.NEXTAUTH_URL}/inscricoes`;

      // Render email template
      const emailHtml = await render(
        InscricaoConfirmadaEmail({
          medicoNome,
          plantao,
          plantaoUrl,
        })
      );

      // Send email via AWS SES
      const command = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
          ToAddresses: [medicoEmail],
        },
        Message: {
          Subject: {
            Data: `Inscrição Confirmada - ${plantao.hospital}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: emailHtml,
              Charset: 'UTF-8',
            },
          },
        },
        ReplyToAddresses: [REPLY_TO],
      });

      const response = await client.send(command);

      console.log('✅ Email sent via AWS SES:', response.MessageId);
      return { success: true, messageId: response.MessageId };
    } catch (error: any) {
      console.error('❌ Error sending email via AWS SES:', error);
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
