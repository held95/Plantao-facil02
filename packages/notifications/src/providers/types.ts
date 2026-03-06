export interface SendResult {
  messageId?: string;
  error?: string;
}

export interface SmsProvider {
  send(to: string, message: string): Promise<SendResult>;
}

export interface EmailProvider {
  sendHtml(to: string, subject: string, html: string, replyTo?: string): Promise<SendResult>;
}

export interface PushProvider {
  send(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<SendResult[]>;
}
