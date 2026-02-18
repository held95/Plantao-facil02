export type UserRole = 'medico' | 'coordenador' | 'admin';

export interface NotificationPreferences {
  novosPlantoes: boolean;
  meusPlantoes: boolean;
  lembrete24h: boolean;
  lembrete1h: boolean;
  alteracoes: boolean;
  email: boolean;
  app: boolean;
  frequenciaEmail: 'imediato' | 'diario' | 'semanal';
  faixaValorMin?: number;
  faixaValorMax?: number;
  locaisInteresse: string[];
}

export interface User {
  id: string;
  nome: string;
  email: string;
  emailNotificacao?: string; // Email para receber alertas (pode ser diferente do email de login)
  telefone?: string;
  crm?: string;
  especialidade?: string;
  role: UserRole;
  avatar?: string;
  ativo: boolean;
  preferenciasNotificacao: NotificationPreferences;
  createdAt: string;
}
