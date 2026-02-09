export type NotificationType =
  | 'novo_plantao'
  | 'inscricao_aprovada'
  | 'inscricao_rejeitada'
  | 'plantao_cancelado'
  | 'lembrete_24h'
  | 'lembrete_1h'
  | 'alteracao_plantao';

export interface Notification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
  plantaoId?: string;
  link?: string;
}
