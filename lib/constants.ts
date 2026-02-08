// Application constants
import type { DocumentType, HospitalLayout } from '@/types/document';

// Application metadata
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Plantão Fácil';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [20, 50, 100];

// Document types with labels and icons
export const DOCUMENT_TYPES: Array<{
  value: DocumentType;
  label: string;
  icon: string;
}> = [
  { value: 'SURGICAL_REPORT', label: 'Relatório Cirúrgico', icon: '🏥' },
  { value: 'MEDICAL_RECORD', label: 'Prontuário Médico', icon: '📋' },
  { value: 'PRESCRIPTION', label: 'Receita Médica', icon: '💊' },
  { value: 'EXAM_RESULT', label: 'Resultado de Exame', icon: '🔬' },
  { value: 'MEDICAL_CERTIFICATE', label: 'Atestado Médico', icon: '📄' },
  { value: 'UNKNOWN', label: 'Tipo Desconhecido', icon: '❓' },
];

// Hospital layouts with labels and colors
export const HOSPITAL_LAYOUTS: Array<{
  value: HospitalLayout;
  label: string;
  color: string;
}> = [
  { value: 'HMB', label: 'Hospital Municipal de Barueri', color: 'blue' },
  { value: 'HGP', label: 'Hospital Geral de Pirajussara', color: 'green' },
  { value: 'SOROCABA', label: 'Hospital Regional de Sorocaba', color: 'purple' },
  { value: 'GUARULHOS', label: 'SPDM Guarulhos', color: 'orange' },
  { value: 'GENERIC', label: 'SPDM Genérico', color: 'gray' },
  { value: 'UNKNOWN', label: 'Layout Desconhecido', color: 'red' },
];

// OCR confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 85,
  MEDIUM: 70,
  LOW: 0,
};

// Sort options for documents
export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Mais recentes primeiro' },
  { value: 'date-asc', label: 'Mais antigos primeiro' },
  { value: 'confidence-desc', label: 'Maior confiança primeiro' },
  { value: 'confidence-asc', label: 'Menor confiança primeiro' },
  { value: 'name-asc', label: 'Nome do paciente (A-Z)' },
  { value: 'name-desc', label: 'Nome do paciente (Z-A)' },
];

// Date range presets for filters
export const DATE_RANGE_PRESETS = [
  { value: 'today', label: 'Hoje' },
  { value: 'last-7-days', label: 'Últimos 7 dias' },
  { value: 'last-30-days', label: 'Últimos 30 dias' },
  { value: 'last-3-months', label: 'Últimos 3 meses' },
  { value: 'last-6-months', label: 'Últimos 6 meses' },
  { value: 'last-year', label: 'Último ano' },
  { value: 'all-time', label: 'Todo o período' },
];

// Medical specialties (common in surgical reports)
export const MEDICAL_SPECIALTIES = [
  'Cirurgia Geral',
  'Cirurgia Pediátrica',
  'Cirurgia Plástica',
  'Cirurgia Urológica',
  'Cirurgia Vascular',
  'Cirurgia de Tórax',
  'Cirurgia Cardíaca',
  'Neurocirurgia',
  'Ortopedia',
  'Ginecologia',
  'Obstetrícia',
  'Oftalmologia',
  'Otorrinolaringologia',
  'Oncologia',
];

// Routes
export const ROUTES = {
  HOME: '/',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: (id: string) => `/documents/${id}`,
  ANALYTICS: '/analytics',
  LOGIN: '/login',
};

// API Endpoints
export const API_ENDPOINTS = {
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
  HEALTH: '/health',
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  NOT_FOUND: 'Documento não encontrado.',
  UNAUTHORIZED: 'Acesso não autorizado. Faça login novamente.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  TIMEOUT: 'A requisição demorou muito. Tente novamente.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  DOCUMENT_LOADED: 'Documento carregado com sucesso.',
  EXPORT_SUCCESS: 'Exportação concluída com sucesso.',
  FILTER_APPLIED: 'Filtros aplicados com sucesso.',
};

// Loading messages
export const LOADING_MESSAGES = {
  LOADING_DOCUMENTS: 'Carregando documentos...',
  LOADING_DOCUMENT: 'Carregando documento...',
  PROCESSING: 'Processando...',
  EXPORTING: 'Exportando...',
};

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_DOCUMENTS: 'Nenhum documento encontrado.',
  NO_DOCUMENTS_FILTERED: 'Nenhum documento corresponde aos filtros aplicados.',
  NO_RECENT_DOCUMENTS: 'Nenhum documento recente.',
};
