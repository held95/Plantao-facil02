import { Plantao } from '@/types/plantao';
import { formatDate } from '@/lib/utils/date';
import type { SMSTemplate } from '@/types/sms';

/**
 * SMS Templates for Plantão Fácil
 *
 * Keep messages concise to minimize SMS costs.
 * Single SMS: up to 160 characters
 * Multi-part SMS: charged per 153 character segment
 */

const APP_URL = process.env.NEXTAUTH_URL || 'https://plantao-facil02-qdja.vercel.app';
const LOGIN_URL = `${APP_URL}/login`;

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
 * SMS de alerta de novo plantão para todos os usuários cadastrados.
 * Formato curto e direto: especialidade, data, horário e valor.
 *
 * @param plantao - Dados do plantão criado
 * @returns SMS template (≤160 chars para custo mínimo)
 */
export function getPlantaoCriadoMessage(plantao: Plantao): SMSTemplate {
  const data = formatDate(plantao.data); // dd/MM
  const valor = plantao.valor ? ` | R$${plantao.valor}` : '';

  const message = `Plantao: ${plantao.especialidade} - ${plantao.hospital} | ${data} ${plantao.horarioInicio}-${plantao.horarioFim}${valor} | ${LOGIN_URL}`;

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
  const data = formatDate(plantao.data);
  const horario = plantao.horarioInicio;

  const message = `🎉 Confirmado! ${plantao.hospital} em ${data} as ${horario}. Dr(a). ${medicoNome}. ${LOGIN_URL}`;

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

  const message = `🔔 Plantao amanha as ${horario} no ${plantao.hospital}. ${LOGIN_URL}`;

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

  const message = `⏰ Plantao em 1h! ${plantao.hospital} - ${local}. ${LOGIN_URL}`;

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
  const data = formatDate(plantao.data);

  let message = `❌ Plantao cancelado: ${plantao.hospital} em ${data}.${motivo ? ` ${motivo}.` : ''} ${LOGIN_URL}`;

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
  const data = formatDate(plantao.data);

  const message = `📝 Plantao atualizado: ${plantao.hospital} (${data}). ${mudancas}. ${LOGIN_URL}`;

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
