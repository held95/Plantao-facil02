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

interface IRDocumentoEmailProps {
  recipientNome: string;
  downloadUrl: string;
  anoReferencia: number;
}

export default function IRDocumentoEmail({
  recipientNome = 'Beneficiario(a)',
  downloadUrl = 'https://plantaofacil.com/login',
  anoReferencia = new Date().getFullYear() - 1,
}: IRDocumentoEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Seu Informe de Rendimentos ${anoReferencia} esta disponivel para download`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Informe de Rendimentos {anoReferencia}</Heading>

          <Text style={greeting}>Ola, {recipientNome}!</Text>

          <Text style={paragraph}>
            Seu <strong>Informe de Rendimentos</strong> referente ao ano-base{' '}
            <strong>{anoReferencia}</strong> esta disponivel para download.
          </Text>

          <Section style={detailsBox}>
            <EmojiRow emoji="📄" label="Documento" value={`Informe de Rendimentos ${anoReferencia}`} />
            <EmojiRow emoji="⏳" label="Link valido por" value="7 dias" />
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={downloadUrl}>
              Baixar Informe de Rendimentos
            </Button>
          </Section>

          <Text style={disclaimer}>
            Este link expira em 7 dias. Apos esse prazo, entre em contato com a coordenacao para solicitar
            um novo link.
          </Text>

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
  margin: '0 40px 24px',
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
  margin: '0 40px 24px',
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

const disclaimer = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '20px',
  padding: '0 40px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
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
