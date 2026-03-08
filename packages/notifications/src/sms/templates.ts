import type { Plantao } from '@plantao/shared';
import { formatDate } from '@plantao/shared';
import type { SMSTemplate } from '@plantao/shared';

/**
 * SMS Templates for Plantão Fácil
 *
 * Keep messages concise to minimize SMS costs.
 * Single SMS: up to 160 characters
 * Multi-part SMS: charged per 153 character segment
 */

const APP_URL = process.env.NEXTAUTH_URL || 'https://plantao-facil02-qdja.vercel.app';
const LOGIN_URL = `${APP_URL}/login`;

function createTemplate(body: string): SMSTemplate {
  return {
    body,
    length: body.length,
    isMultiPart: body.length > 160,
  };
}

export function getPlantaoCriadoMessage(plantao: Plantao): SMSTemplate {
  const data = formatDate(plantao.data);
  const valor = plantao.valor
    ? plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    : '0,00';

  const message =
    `📢 Vagas Disponíveis para Plantão Médico\n` +
    `🩺 Especialidade: ${plantao.especialidade}\n` +
    `🏥 ${plantao.hospital}\n` +
    `📅 ${data}\n` +
    `⏰ ${plantao.horarioInicio} às ${plantao.horarioFim}\n` +
    `💰 Remuneração: R$ ${valor}\n` +
    `Garanta sua vaga acessando:\n` +
    `🔗 ${LOGIN_URL}`;

  return createTemplate(message);
}

export function getInscricaoConfirmadaMessage(
  medicoNome: string,
  plantao: Plantao
): SMSTemplate {
  const data = formatDate(plantao.data);
  const horario = plantao.horarioInicio;

  const message = `Confirmado! ${plantao.hospital} em ${data} as ${horario}. Dr(a). ${medicoNome}. ${LOGIN_URL}`;

  return createTemplate(message);
}

export function getLembrete24hMessage(
  medicoNome: string,
  plantao: Plantao
): SMSTemplate {
  const horario = plantao.horarioInicio;

  const message = `Plantao amanha as ${horario} no ${plantao.hospital}. ${LOGIN_URL}`;

  return createTemplate(message);
}

export function getLembrete1hMessage(
  medicoNome: string,
  plantao: Plantao
): SMSTemplate {
  const horario = plantao.horarioInicio;
  const local = `${plantao.cidade}/${plantao.estado}`;

  const message = `Plantao em 1h! ${plantao.hospital} - ${local}. ${LOGIN_URL}`;

  return createTemplate(message);
}

export function getPlantaoCanceladoMessage(
  medicoNome: string,
  plantao: Plantao,
  motivo?: string
): SMSTemplate {
  const data = formatDate(plantao.data);

  const message = `Plantao cancelado: ${plantao.hospital} em ${data}.${motivo ? ` ${motivo}.` : ''} ${LOGIN_URL}`;

  return createTemplate(message);
}

export function getPlantaoAtualizadoMessage(
  medicoNome: string,
  plantao: Plantao,
  mudancas: string
): SMSTemplate {
  const data = formatDate(plantao.data);

  const message = `Plantao atualizado: ${plantao.hospital} (${data}). ${mudancas}. ${LOGIN_URL}`;

  return createTemplate(message);
}

export function getNotificacaoGeralMessage(
  titulo: string,
  mensagem: string
): SMSTemplate {
  const message = `${titulo}: ${mensagem}`;

  return createTemplate(message);
}
