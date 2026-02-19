import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { render } from '@react-email/render';
import PlantaoCriadoEmail from '@/emails/PlantaoCriadoEmail';
import InscricaoConfirmadaEmail from '@/emails/InscricaoConfirmadaEmail';
import { Plantao } from '@/types/plantao';

let sesClient: SESClient | null = null;

function getSESClient(): SESClient | null {
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return sesClient;
}

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'noreply@plantaofacil.com';
const REPLY_TO = process.env.AWS_SES_REPLY_TO || 'suporte@plantaofacil.com';
const EMAIL_ENABLED = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendHtmlEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!EMAIL_ENABLED) {
    console.log('[awsSesService] Email disabled. Skipping send.');
    return { success: true };
  }

  const client = getSESClient();
  if (!client) {
    return { success: false, error: 'AWS SES credentials not configured' };
  }

  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
        },
      },
      ReplyToAddresses: [REPLY_TO],
    });

    const response = await client.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    console.error('[awsSesService] Send failed:', error);
    return { success: false, error: error.message };
  }
}

export const awsSesService = {
  async sendPlantaoCriadoEmail(
    coordenadorEmail: string,
    coordenadorNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    const plantaoUrl = `${process.env.NEXTAUTH_URL}/plantoes/${plantao.id}`;
    const emailHtml = await render(
      PlantaoCriadoEmail({
        coordenadorNome,
        plantao,
        plantaoUrl,
      })
    );

    return sendHtmlEmail({
      to: coordenadorEmail,
      subject: `Plantao criado - ${plantao.hospital}`,
      html: emailHtml,
    });
  },

  async sendInscricaoConfirmadaEmail(
    medicoEmail: string,
    medicoNome: string,
    plantao: Plantao
  ): Promise<SendEmailResult> {
    const plantaoUrl = `${process.env.NEXTAUTH_URL}/inscricoes`;
    const emailHtml = await render(
      InscricaoConfirmadaEmail({
        medicoNome,
        plantao,
        plantaoUrl,
      })
    );

    return sendHtmlEmail({
      to: medicoEmail,
      subject: `Inscricao confirmada - ${plantao.hospital}`,
      html: emailHtml,
    });
  },

  async sendPlantaoCriadoEmailToAll(
    recipients: { nome: string; email: string }[],
    plantao: Plantao
  ): Promise<{ sent: number; failed: number }> {
    const result = { sent: 0, failed: 0 };

    for (const recipient of recipients) {
      const response = await this.sendPlantaoCriadoEmail(
        recipient.email,
        recipient.nome,
        plantao
      );
      if (response.success) result.sent++;
      else result.failed++;
    }

    return result;
  },

  async sendCadastroRecebidoEmail(email: string): Promise<SendEmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Cadastro recebido</h2>
        <p>Recebemos sua solicitacao de cadastro no Plantao Facil.</p>
        <p>Seu acesso esta pendente de validacao manual da equipe.</p>
        <p>Assim que sua conta for aprovada, voce recebera um novo email.</p>
      </div>
    `;

    return sendHtmlEmail({
      to: email,
      subject: 'Plantao Facil - cadastro recebido',
      html,
    });
  },

  async sendContaAprovadaEmail(email: string): Promise<SendEmailResult> {
    const loginUrl = `${process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Conta aprovada</h2>
        <p>Sua conta no Plantao Facil foi aprovada com sucesso.</p>
        <p>Agora voce ja pode fazer login e acessar os plantoes.</p>
        <p><a href="${loginUrl}">Entrar no sistema</a></p>
      </div>
    `;

    return sendHtmlEmail({
      to: email,
      subject: 'Plantao Facil - conta aprovada',
      html,
    });
  },

  async sendResetSenhaEmail(email: string, resetUrl: string): Promise<SendEmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Redefinicao de senha</h2>
        <p>Recebemos uma solicitacao para redefinir sua senha.</p>
        <p>Use o link abaixo para criar uma nova senha:</p>
        <p><a href="${resetUrl}">Redefinir senha</a></p>
        <p>Este link expira em 60 minutos e pode ser usado apenas uma vez.</p>
      </div>
    `;

    return sendHtmlEmail({
      to: email,
      subject: 'Plantao Facil - redefinicao de senha',
      html,
    });
  },

  async sendLembrete24h(): Promise<SendEmailResult> {
    return { success: true };
  },

  async sendLembrete1h(): Promise<SendEmailResult> {
    return { success: true };
  },
};

