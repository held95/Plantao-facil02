import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components';
import { Plantao } from '@/types/plantao';

interface InscricaoConfirmadaEmailProps {
  medicoNome: string;
  plantao: Plantao;
  plantaoUrl: string;
}

export default function InscricaoConfirmadaEmail({
  medicoNome = 'Doutor(a)',
  plantao,
  plantaoUrl = 'https://plantaofacil.com',
}: InscricaoConfirmadaEmailProps) {
  const dataFormatada = new Date(plantao.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Inscrição confirmada - {plantao.hospital}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src={`${plantaoUrl.replace(/\/inscricoes.*$/, '')}/logos/logo-email.png`}
              alt="Plantão Fácil"
              height="40"
              style={logo}
            />
          </Section>

          <Heading style={h1}>🎉 Inscrição Confirmada!</Heading>

          <Text style={text}>Olá Dr(a). {medicoNome},</Text>

          <Text style={text}>
            Sua inscrição no plantão foi confirmada com sucesso! Veja os detalhes
            abaixo e prepare-se para o dia.
          </Text>

          <Section style={detailsBox}>
            <Heading as="h2" style={h2}>
              📋 Detalhes do Plantão
            </Heading>

            <DetailRow label="Hospital" value={plantao.hospital} />
            <DetailRow label="Especialidade" value={plantao.especialidade} />
            <DetailRow label="Data" value={dataFormatada} />
            <DetailRow
              label="Horário"
              value={`${plantao.horarioInicio} - ${plantao.horarioFim}`}
            />
            <DetailRow
              label="Local"
              value={`${plantao.cidade}, ${plantao.estado}`}
            />
            <DetailRow
              label="Valor"
              value={`R$ ${plantao.valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}`}
            />
          </Section>

          {plantao.descricao && (
            <Section style={descriptionBox}>
              <Text style={detailLabel}>📝 INFORMAÇÕES IMPORTANTES:</Text>
              <Text style={descriptionText}>{plantao.descricao}</Text>
            </Section>
          )}

          {plantao.requisitos && plantao.requisitos.length > 0 && (
            <Section style={requirementsBox}>
              <Text style={requirementLabel}>⚠️ REQUISITOS:</Text>
              <ul style={list}>
                {plantao.requisitos.map((req, index) => (
                  <li key={index} style={listItem}>
                    {req}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={plantaoUrl}>
              Ver Meus Plantões
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={reminderBox}>
            <Text style={reminderText}>
              📅 <strong>Lembretes automáticos:</strong> Você receberá
              notificações 24 horas e 1 hora antes do plantão.
            </Text>
          </Section>

          <Text style={footer}>
            Em caso de dúvidas ou imprevistos, entre em contato com o hospital ou
            nossa equipe de suporte.
          </Text>

          <Text style={footer}>
            Plantão Fácil - Conectando Hospitais e Médicos
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <Text style={detailLabel}>{label}:</Text>
      <Text style={detailValue}>{value}</Text>
    </div>
  );
}

// Styles
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
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.3',
};

const h2 = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 20px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '16px 0',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 40px',
};

const descriptionBox = {
  padding: '0 40px',
  margin: '24px 0',
};

const requirementsBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '24px 40px',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 8px 0',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '4px 0 0',
  fontWeight: '600',
};

const descriptionText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0 0',
};

const requirementLabel = {
  color: '#92400e',
  fontSize: '13px',
  margin: '0 0 12px 0',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const list = {
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '6px 0',
  fontWeight: '500',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 40px',
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

const reminderBox = {
  backgroundColor: '#dbeafe',
  border: '1px solid #60a5fa',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 40px',
};

const reminderText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
  marginBottom: '20px',
};

const logo = {
  height: '40px',
  width: 'auto',
};
