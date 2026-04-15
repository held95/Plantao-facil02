import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ResetSenhaEmailProps {
  resetUrl: string;
  expirationMinutes: number;
}

export default function ResetSenhaEmail({
  resetUrl = 'https://plantaofacil.com/reset-password?token=exemplo',
  expirationMinutes = 60,
}: ResetSenhaEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Redefina sua senha do Plantao Facil</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Redefinicao de Senha</Heading>

          <Text style={paragraph}>
            Recebemos uma solicitacao para redefinir a senha da sua conta no{' '}
            <strong>Plantao Facil</strong>.
          </Text>

          <Text style={paragraph}>
            Clique no botao abaixo para criar uma nova senha:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Redefinir senha
            </Button>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              🔒 Este link expira em <strong>{expirationMinutes} minutos</strong> e pode ser
              usado apenas uma vez.
            </Text>
            <Text style={warningText}>
              Se voce nao solicitou a redefinicao de senha, ignore este e-mail. Sua senha
              permanece inalterada.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>Plantao Facil — Conectando Hospitais e Medicos</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 8px',
  padding: '0 40px',
  lineHeight: '1.3',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '0 0 16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 40px 32px',
};

const button = {
  backgroundColor: '#334155',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const warningBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '0 40px 24px',
};

const warningText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '0 40px 24px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  textAlign: 'center' as const,
  margin: '0',
};
