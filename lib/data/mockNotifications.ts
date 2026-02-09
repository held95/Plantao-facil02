import { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    tipo: 'novo_plantao',
    titulo: 'Novo plantão disponível',
    mensagem: 'Plantão de Cardiologia no Hospital São Paulo - R$ 1.200',
    lida: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1h atrás
    plantaoId: 'p1',
    link: '/plantoes/p1',
  },
  {
    id: '2',
    tipo: 'lembrete_24h',
    titulo: 'Lembrete: Plantão amanhã',
    mensagem: 'Seu plantão no Hospital Central começa amanhã às 08:00',
    lida: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2h atrás
    link: '/inscricoes',
  },
  {
    id: '3',
    tipo: 'inscricao_aprovada',
    titulo: 'Inscrição aprovada!',
    mensagem: 'Sua inscrição para o plantão de Pediatria foi aprovada',
    lida: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    link: '/inscricoes',
  },
  {
    id: '4',
    tipo: 'novo_plantao',
    titulo: 'Novo plantão disponível',
    mensagem: 'Plantão de Emergência no Hospital das Clínicas - R$ 1.500',
    lida: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3h atrás
    plantaoId: 'p2',
    link: '/plantoes/p2',
  },
  {
    id: '5',
    tipo: 'alteracao_plantao',
    titulo: 'Alteração no plantão',
    mensagem: 'O horário do seu plantão foi alterado para 14:00',
    lida: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4h atrás
    link: '/inscricoes',
  },
  {
    id: '6',
    tipo: 'lembrete_1h',
    titulo: 'Lembrete: Plantão em 1 hora',
    mensagem: 'Seu plantão no Hospital São Paulo começa em 1 hora',
    lida: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    link: '/inscricoes',
  },
  {
    id: '7',
    tipo: 'inscricao_rejeitada',
    titulo: 'Inscrição não aprovada',
    mensagem: 'Sua inscrição para o plantão de Ortopedia não foi aprovada',
    lida: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
    link: '/inscricoes',
  },
  {
    id: '8',
    tipo: 'plantao_cancelado',
    titulo: 'Plantão cancelado',
    mensagem: 'O plantão no Hospital Santa Casa foi cancelado',
    lida: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 dias atrás
    link: '/plantoes',
  },
];
