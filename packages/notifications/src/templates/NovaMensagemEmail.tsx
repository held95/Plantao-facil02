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

interface NovaMensagemEmailProps {
  recipientNome: string;
  senderNome: string;
  assunto: string;
  corpo: string;
  mensagensUrl: string;
}

export default function NovaMensagemEmail({
  recipientNome = 'Medico(a)',
  senderNome = 'Usuario',
  assunto = 'Nova mensagem',
  corpo = '',
  mensagensUrl = 'https://plantaofacil.com/mensagens',
}: NovaMensagemEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nova mensagem de {senderNome}: {assunto}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nova Mensagem Recebida</Heading>

          <Text style={greeting}>Ola, Dr(a). {recipientNome}!</Text>

          <Text style={paragraph}>
            <strong>{senderNome}</strong> enviou uma mensagem para voce.
          </Text>

          <Section style={detailsBox}>
            <EmojiRow emoji="✉️" label="Assunto" value={assunto} />
            <EmojiRow emoji="👤" label="De" value={senderNome} />
          </Section>

          <Section style={corpoBox}>
            <Text style={corpoText}>{corpo}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={mensagensUrl}>
              Ver Mensagem
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>Plantao Facil — Conectando Hospitais e Medicos</Text>
        </Container>
      </Body>
    </Html>
  );
}

function EmojiRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Text style={row}>
      {emoji} <span style={labelStyle}>{label}:</span> {value}
    </Text>
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

const greeting = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '0 0 16px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '0 0 24px',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 40px 16px',
};

const corpoBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px 24px',
  margin: '0 40px 24px',
};

const corpoText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  fontStyle: 'italic' as const,
  margin: '0',
};

const row = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '0',
};

const labelStyle = {
  color: '#6b7280',
  fontWeight: '500' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 40px 32px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
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
