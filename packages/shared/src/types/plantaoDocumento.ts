export type PlantaoDocumentoStatus = 'ativo' | 'arquivado' | 'versao_anterior';

export interface PlantaoDocumento {
  id: string;
  plantaoId: string;
  titulo: string;
  descricao?: string;
  fileName: string;
  s3Key: string;
  s3Bucket: string;
  mimeType: string;
  tamanhoBytes: number;
  uploadedBy: string;
  uploadedByNome?: string;
  uploadedAt: string;
  status: PlantaoDocumentoStatus;
  parentId?: string;
  version?: number;
}

export interface DocumentRead {
  documentId: string;
  userId: string;
  visualizadoAt: string;
}

export interface PlantaoDocumentoComLeitura extends PlantaoDocumento {
  lido: boolean;
  visualizadoAt?: string;
}

export interface DocumentNotificacao {
  id: string;
  plantaoId: string;
  titulo: string;
  uploadedAt: string;
  uploadedByNome?: string;
  lido: boolean;
}

export interface DocumentNotificacaoResponse {
  unreadCount: number;
  recentes: DocumentNotificacao[];
}

export interface UploadDocumentoResponse {
  documento: PlantaoDocumento;
  downloadUrl: string;
}
