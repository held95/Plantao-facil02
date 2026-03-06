// Type definitions for medical documents

export type DocumentType =
  | 'SURGICAL_REPORT'
  | 'MEDICAL_RECORD'
  | 'PRESCRIPTION'
  | 'EXAM_RESULT'
  | 'MEDICAL_CERTIFICATE'
  | 'UNKNOWN';

export type HospitalLayout =
  | 'HMB'
  | 'HGP'
  | 'SOROCABA'
  | 'GUARULHOS'
  | 'GENERIC'
  | 'UNKNOWN';

export interface Assistant {
  nome: string;
  crm: string;
}

export interface Document {
  id: string;
  nomeHospital?: string;
  nomeMedico?: string;
  crmDoMedico?: string;
  cirurgiao?: string;
  crmCirurgiao?: string;
  nomeAssistente?: string;
  crmAssistente?: string;
  assistentes?: Assistant[];
  especialidade?: string;
  nomePaciente?: string;
  nomeSocial?: string;
  idade?: string;
  rh?: string;
  cpf?: string;
  rg?: string;
  cns?: string;
  dataNascimento?: string;
  sexo?: 'MASCULINO' | 'FEMININO' | string;
  estadoCivil?: string;
  dataInternacao?: string;
  diasInternacao?: string;
  quartoLeito?: string;
  unidadeInternacao?: string;
  cirurgiaProposta?: string;
  dataDocumento?: string;
  dataAtendimento?: string;
  dataCirurgia?: string;
  fileName: string;
  extractedText?: string;
  documentType: DocumentType;
  confidence: number;
  detectedUnit?: HospitalLayout;
  bucket?: string;
  key?: string;
  blocks?: number;
  processedAt: string;
  createdAt: string;
}

export interface DocumentListResponse {
  documents: Document[];
  count: number;
  scannedCount: number;
  nextToken?: string;
}

export interface DocumentFilters {
  search?: string;
  documentType?: DocumentType;
  hospital?: string;
  specialty?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minConfidence?: number;
}

export interface ApiError {
  error: string;
  type?: string;
  details?: string;
}
