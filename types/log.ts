export type ActivityType =
  | 'plantao_criado'
  | 'plantao_atualizado'
  | 'plantao_cancelado'
  | 'inscricao_realizada'
  | 'inscricao_aprovada'
  | 'inscricao_rejeitada'
  | 'inscricao_cancelada'
  | 'usuario_login'
  | 'usuario_logout';

export interface ActivityLog {
  id: string;
  tipo: ActivityType;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  descricao: string;
  timestamp: string;
  pagina?: string;
  metadata?: {
    plantaoId?: string;
    inscricaoId?: string;
    [key: string]: any;
  };
}

export interface ActivityStats {
  totalAtividades: number;
  atividadesHoje: number;
  tiposDeAcao: number;
}
