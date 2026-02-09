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
} from '@react-email/components';
import { Plantao } from '@/types/plantao';

interface PlantaoCriadoEmailProps {
  coordenadorNome: string;
  plantao: Plantao;
  plantaoUrl: string;
}

export default function PlantaoCriadoEmail({
  coordenadorNome = 'Coordenador',
  plantao,
  plantaoUrl = 'https://plantaofacil.com',
}: PlantaoCriadoEmailProps) {
  const dataFormatada = new Date(plantao.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Plantão criado com sucesso - {plantao.hospital}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Plantão Criado com Sucesso!</Heading>

          <Text style={text}>Olá {coordenadorNome},</Text>

          <Text style={text}>
            Seu plantão foi criado e publicado com sucesso na plataforma Plantão
            Fácil. Os médicos já podem visualizar e se inscrever.
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
            <DetailRow
              label="Vagas"
              value={`${plantao.vagasTotal} vagas disponíveis`}
            />
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={plantaoUrl}>
              Ver Plantão na Plataforma
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            💡 <strong>Próximos passos:</strong> Você receberá notificações
            quando médicos se inscreverem neste plantão.
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

const detailLabel = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '4px 0 0',
  fontWeight: '600',
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
