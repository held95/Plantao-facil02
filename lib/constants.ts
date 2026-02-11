// Application constants

// Application metadata
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Plantão Fácil';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

// Routes
export const ROUTES = {
  HOME: '/',
  PLANTOES: '/plantoes',
  PLANTAO_DETAIL: (id: string) => `/plantoes/${id}`,
  PERFIL: '/perfil',
};

// Especialidades médicas
export const ESPECIALIDADES = [
  'Clínica Geral',
  'Cirurgia Geral',
  'Pediatria',
  'Ortopedia',
  'Cardiologia',
  'Pronto Socorro',
  'Ginecologia e Obstetrícia',
  'Anestesiologia',
  'Neurologia',
  'Psiquiatria',
];

// Success messages
export const SUCCESS_MESSAGES = {
  INSCRICAO_SUCESSO: 'Inscrição realizada com sucesso!',
  CANCELAMENTO_SUCESSO: 'Inscrição cancelada com sucesso.',
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  SEM_VAGAS: 'Este plantão não possui mais vagas disponíveis.',
  JA_INSCRITO: 'Você já está inscrito neste plantão.',
};

// Loading messages
export const LOADING_MESSAGES = {
  CARREGANDO_PLANTOES: 'Carregando plantões...',
  PROCESSANDO: 'Processando...',
};

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  SEM_PLANTOES: 'Nenhum plantão disponível no momento.',
  SEM_RESULTADOS: 'Nenhum plantão encontrado com os filtros aplicados.',
};
