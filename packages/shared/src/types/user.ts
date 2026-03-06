export type UserRole = 'medico' | 'coordenador' | 'admin';
export type UserApprovalStatus = 'pendente_aprovacao' | 'aprovado' | 'rejeitado';

export interface NotificationPreferences {
  novosPlantoes: boolean;
  meusPlantoes: boolean;
  lembrete24h: boolean;
  lembrete1h: boolean;
  alteracoes: boolean;
  email: boolean;
  app: boolean;
  smsEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  frequenciaEmail: 'imediato' | 'diario' | 'semanal';
  faixaValorMin?: number;
  faixaValorMax?: number;
  locaisInteresse: string[];
}

export interface User {
  id: string;
  nome: string;
  email: string;
  emailNotificacao?: string;
  telefone?: string;
  crm?: string;
  especialidade?: string;
  role: UserRole;
  status?: UserApprovalStatus;
  avatar?: string;
  ativo: boolean;
  preferenciasNotificacao: NotificationPreferences;
  createdAt: string;
}
