/**
 * SMS Type Definitions — AWS SNS
 */

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

export interface SMSTemplate {
  body: string;
  length: number;
  isMultiPart: boolean;
}

export type SMSNotificationType =
  | 'plantao_criado'
  | 'inscricao_confirmada'
  | 'lembrete_24h'
  | 'lembrete_1h'
  | 'plantao_cancelado'
  | 'plantao_atualizado';

export interface SMSNotification {
  to: string;
  message: string;
  type: SMSNotificationType;
  plantaoId?: string;
  userId?: string;
}
