import { apiClient } from './client';
import type { PlantaoDocumento } from '@plantao/shared';

export interface DocumentoComLeitura extends PlantaoDocumento {
  lido: boolean;
  visualizadoAt?: string;
}

export async function fetchDocumentosByPlantao(
  plantaoId: string
): Promise<DocumentoComLeitura[]> {
  const response = await apiClient.get<{ documentos: DocumentoComLeitura[] }>(
    `/plantoes/${plantaoId}/documentos`
  );
  return response.data.documentos;
}

export async function markDocumentoAsViewed(docId: string): Promise<void> {
  await apiClient.post(`/documentos/${docId}/visualizado`);
}

export async function getDocumentoDownloadUrl(docId: string): Promise<string> {
  const response = await apiClient.get<{ downloadUrl: string; documento: PlantaoDocumento }>(
    `/documentos/${docId}`
  );
  return response.data.downloadUrl;
}
