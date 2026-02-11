/**
 * SMS Type Definitions
 *
 * TypeScript interfaces for SMS functionality using Twilio
 */

/**
 * Result of SMS sending operation
 */
export interface SendSMSResult {
  /** Whether the SMS was sent successfully */
  success: boolean;
  /** Twilio message SID (unique identifier) */
  messageId?: string;
  /** Error message if sending failed */
  error?: string;
  /** Twilio error code if applicable */
  errorCode?: string;
}

/**
 * SMS template data structure
 */
export interface SMSTemplate {
  /** SMS message body */
  body: string;
  /** Character count (for multi-part SMS detection) */
  length: number;
  /** Whether message exceeds single SMS limit (160 chars) */
  isMultiPart: boolean;
}

/**
 * SMS notification types
 */
export type SMSNotificationType =
  | 'plantao_criado'
  | 'inscricao_confirmada'
  | 'lembrete_24h'
  | 'lembrete_1h'
  | 'plantao_cancelado'
  | 'plantao_atualizado';

/**
 * SMS notification payload
 */
export interface SMSNotification {
  /** Recipient phone number in E.164 format */
  to: string;
  /** SMS message body */
  message: string;
  /** Type of notification */
  type: SMSNotificationType;
  /** Related plantão ID (if applicable) */
  plantaoId?: string;
  /** Related user ID (if applicable) */
  userId?: string;
}

/**
 * Twilio configuration
 */
export interface TwilioConfig {
  /** Twilio Account SID */
  accountSid: string;
  /** Twilio Auth Token */
  authToken: string;
  /** Twilio phone number (sender) */
  phoneNumber: string;
  /** Whether SMS notifications are enabled */
  enabled: boolean;
}
