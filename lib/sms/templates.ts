import { Plantao } from '@/types/plantao';
import { formatDate, formatTime } from '@/lib/utils/date';
import type { SMSTemplate } from '@/types/sms';

/**
 * SMS Templates for Plantão Fácil
 *
 * Keep messages concise to minimize SMS costs.
 * Single SMS: up to 160 characters
 * Multi-part SMS: charged per 153 character segment
 */

const APP_URL = process.env.NEXTAUTH_URL || 'https://plantaofacil.com';

/**
 * Creates SMS template with metadata
 */
function createTemplate(body: string): SMSTemplate {
  return {
    body,
    length: body.length,
    isMultiPart: body.length > 160,
  };
}

/**
 * SMS when coordinator creates a plantão
 *
 * @param coordenadorNome - Coordinator name
 * @param plantao - Plantão data
 * @returns SMS template
 */
export function getPlantaoCriadoMessage(
  coordenadorNome: string,
  plantao: Plantao
): SMSTemplate {
  const data = formatDate(plantao.data, 'short'); // dd/MM
  const horario = `${plantao.horarioInicio}-${plantao.horarioFim}`;

  const message = `✅ Plantão criado! ${plantao.hospital} - ${plantao.especialidade}. ${data} às ${horario}. Acesse: ${APP_URL}`;

  return createTemplate(message);
}

/**
 * SMS when doctor registers for a plantão
 *
 * @param medicoNome - Doctor name
 * @param plantao - Plantão data
 * @returns SMS template
 */
export function getInscricaoConfirmadaMessage(
  medicoNome: string,
  plantao: Plantao
): SMSTemplate {
  const data = formatDate(plantao.data, 'short');
  const horario = plantao.horarioInicio;

  const message = `🎉 Inscrição confirmada! ${plantao.hospital} em ${data} às ${horario}. Boa sorte, Dr(a). ${medicoNome}!`;

  return createTemplate(message);
}

/**
 * SMS reminder 24 hours before plantão
 *
 * @param medicoNome - Doctor name
 * @param plantao - Plantão data
 * @returns SMS template
 */
export function getLembrete24hMessage(
  medicoNome: string,
  plantao: Plantao
): SMSTemplate {
  const horario = plantao.horarioInicio;

  const message = `🔔 Lembrete: Plantão amanhã às ${horario} no ${plantao.hospital}. Prepare-se!`;

  return createTemplate(message);
}

/**
 * SMS reminder 1 hour before plantão
 *
 * @param medicoNome - Doctor name
 * @param plantao - Plantão data
 * @returns SMS template
 */
export function getLembrete1hMessage(
  medicoNome: string,
  plantao: Plantao
): SMSTemplate {
  const horario = plantao.horarioInicio;
  const local = `${plantao.cidade}/${plantao.estado}`;

  const message = `⏰ Seu plantão começa em 1 hora! ${plantao.hospital} - ${local}. Até lá!`;

  return createTemplate(message);
}

/**
 * SMS when plantão is cancelled
 *
 * @param medicoNome - Doctor name
 * @param plantao - Plantão data
 * @param motivo - Cancellation reason
 * @returns SMS template
 */
export function getPlantaoCanceladoMessage(
  medicoNome: string,
  plantao: Plantao,
  motivo?: string
): SMSTemplate {
  const data = formatDate(plantao.data, 'short');

  let message = `❌ Plantão cancelado: ${plantao.hospital} em ${data}.`;

  if (motivo) {
    message += ` Motivo: ${motivo}.`;
  }

  message += ` Desculpe o transtorno.`;

  return createTemplate(message);
}

/**
 * SMS when plantão details are updated
 *
 * @param medicoNome - Doctor name
 * @param plantao - Plantão data
 * @param mudancas - Description of changes
 * @returns SMS template
 */
export function getPlantaoAtualizadoMessage(
  medicoNome: string,
  plantao: Plantao,
  mudancas: string
): SMSTemplate {
  const data = formatDate(plantao.data, 'short');

  const message = `📝 Plantão atualizado: ${plantao.hospital} (${data}). ${mudancas}. Verifique: ${APP_URL}`;

  return createTemplate(message);
}

/**
 * Generic notification SMS
 *
 * @param titulo - Notification title
 * @param mensagem - Notification message
 * @returns SMS template
 */
export function getNotificacaoGeralMessage(
  titulo: string,
  mensagem: string
): SMSTemplate {
  const message = `${titulo}: ${mensagem}`;

  return createTemplate(message);
}
