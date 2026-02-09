import type { ActivityLog, ActivityStats } from '@/types/log';

export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    tipo: 'usuario_login',
    usuarioId: '1',
    usuarioNome: 'Hélder Corrêa',
    usuarioEmail: 'helder.datacience@gmail.com',
    descricao: 'Login realizado',
    timestamp: '2026-02-08T16:40:00',
    pagina: 'Home',
  },
  {
    id: '2',
    tipo: 'usuario_login',
    usuarioId: '1',
    usuarioNome: 'Hélder Corrêa',
    usuarioEmail: 'helder.datacience@gmail.com',
    descricao: 'Login realizado',
    timestamp: '2026-02-08T10:32:00',
    pagina: 'Home',
  },
  {
    id: '3',
    tipo: 'usuario_login',
    usuarioId: '2',
    usuarioNome: 'robsoncsouza73',
    usuarioEmail: 'robsoncsouza73@gmail.com',
    descricao: 'Login realizado',
    timestamp: '2026-02-05T12:31:00',
    pagina: 'Home',
  },
  {
    id: '4',
    tipo: 'usuario_login',
    usuarioId: '2',
    usuarioNome: 'robsoncsouza73',
    usuarioEmail: 'robsoncsouza73@gmail.com',
    descricao: 'Login realizado',
    timestamp: '2026-02-05T12:23:00',
    pagina: 'Home',
  },
  {
    id: '5',
    tipo: 'usuario_login',
    usuarioId: '2',
    usuarioNome: 'robsoncsouza73',
    usuarioEmail: 'robsoncsouza73@gmail.com',
    descricao: 'Login realizado',
    timestamp: '2026-02-04T20:25:00',
    pagina: 'Home',
  },
  {
    id: '6',
    tipo: 'usuario_login',
    usuarioId: '2',
    usuarioNome: 'robsoncsouza73',
    usuarioEmail: 'robsoncsouza73@gmail.com',
    descricao: 'Login realizado',
    timestamp: '2026-02-04T18:20:00',
    pagina: 'Home',
  },
  {
    id: '7',
    tipo: 'plantao_criado',
    usuarioId: '1',
    usuarioNome: 'Hélder Corrêa',
    usuarioEmail: 'helder.datacience@gmail.com',
    descricao: 'Criou plantão "Plantão de Fim de Semana"',
    timestamp: '2026-02-07T14:15:00',
    pagina: 'Criar Plantão',
    metadata: {
      plantaoId: '1',
    },
  },
  {
    id: '8',
    tipo: 'inscricao_realizada',
    usuarioId: '2',
    usuarioNome: 'robsoncsouza73',
    usuarioEmail: 'robsoncsouza73@gmail.com',
    descricao: 'Inscreveu-se no plantão "Hospital Central - Emergência"',
    timestamp: '2026-02-06T09:30:00',
    pagina: 'Plantões',
    metadata: {
      plantaoId: '2',
      inscricaoId: '101',
    },
  },
  {
    id: '9',
    tipo: 'plantao_atualizado',
    usuarioId: '1',
    usuarioNome: 'Hélder Corrêa',
    usuarioEmail: 'helder.datacience@gmail.com',
    descricao: 'Atualizou plantão "Plantão Noturno UTI"',
    timestamp: '2026-02-05T18:45:00',
    pagina: 'Editar Plantão',
    metadata: {
      plantaoId: '3',
    },
  },
  {
    id: '10',
    tipo: 'inscricao_aprovada',
    usuarioId: '1',
    usuarioNome: 'Hélder Corrêa',
    usuarioEmail: 'helder.datacience@gmail.com',
    descricao: 'Aprovou inscrição de Dr. João Silva',
    timestamp: '2026-02-05T11:20:00',
    pagina: 'Gerenciar Inscrições',
    metadata: {
      inscricaoId: '102',
    },
  },
];

export const mockActivityStats: ActivityStats = {
  totalAtividades: 232,
  atividadesHoje: 0,
  tiposDeAcao: 6,
};

// Helper to get activity type label in Portuguese
export function getActivityTypeLabel(tipo: string): string {
  const labels: Record<string, string> = {
    plantao_criado: 'Plantão Criado',
    plantao_atualizado: 'Plantão Atualizado',
    plantao_cancelado: 'Plantão Cancelado',
    inscricao_realizada: 'Inscrição Realizada',
    inscricao_aprovada: 'Inscrição Aprovada',
    inscricao_rejeitada: 'Inscrição Rejeitada',
    inscricao_cancelada: 'Inscrição Cancelada',
    usuario_login: 'Login',
    usuario_logout: 'Logout',
  };

  return labels[tipo] || tipo;
}

// Helper to get activity type badge color
export function getActivityTypeBadgeVariant(tipo: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
    plantao_criado: 'success',
    plantao_atualizado: 'warning',
    plantao_cancelado: 'destructive',
    inscricao_realizada: 'success',
    inscricao_aprovada: 'success',
    inscricao_rejeitada: 'destructive',
    inscricao_cancelada: 'destructive',
    usuario_login: 'secondary',
    usuario_logout: 'secondary',
  };

  return variants[tipo] || 'default';
}
