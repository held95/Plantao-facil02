export type NotificationEvent =
  | 'PLANTAO_CREATED'
  | 'INSCRICAO_CONFIRMADA'
  | 'CONTA_APROVADA'
  | 'CONTA_REJEITADA'
  | 'RESET_SENHA'
  | 'DOCUMENTO_CRIADO'
  | 'SWAP_PROPOSTO'
  | 'SWAP_ACEITO'
  | 'SWAP_REJEITADO';

export type NotificationChannel = 'sms' | 'email' | 'push';
export type DeliveryStatus = 'pending' | 'sent' | 'failed';

export interface NotificationRecipient {
  userId: string;
  nome: string;
  email?: string;
  phone?: string;
  pushTokens?: string[];
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export interface DeliveryLog {
  id: string;
  userId: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  status: DeliveryStatus;
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: string;
}
