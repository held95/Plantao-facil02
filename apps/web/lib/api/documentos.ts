import type {
  PlantaoDocumentoComLeitura,
  PlantaoDocumento,
  DocumentNotificacaoResponse,
  UploadDocumentoResponse,
} from '@plantao/shared';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface DocumentoFilters {
  q?: string;
  desde?: string;
  ate?: string;
  includeArchived?: boolean;
}

export async function getDocumentosByPlantao(
  plantaoId: string,
  filters?: DocumentoFilters
): Promise<PlantaoDocumentoComLeitura[]> {
  const params = new URLSearchParams();
  if (filters?.q) params.set('q', filters.q);
  if (filters?.desde) params.set('desde', filters.desde);
  if (filters?.ate) params.set('ate', filters.ate);
  if (filters?.includeArchived) params.set('includeArchived', 'true');
  const qs = params.toString() ? `?${params.toString()}` : '';

  const data = await apiFetch<{ documentos: PlantaoDocumentoComLeitura[] }>(
    `/api/plantoes/${plantaoId}/documentos${qs}`
  );
  return data.documentos;
}

export async function getDocumentoById(id: string): Promise<{
  documento: PlantaoDocumento;
  downloadUrl: string;
  lido: boolean;
  visualizadoAt: string | null;
}> {
  return apiFetch(`/api/documentos/${id}`);
}

export async function marcarComoVisualizado(documentoId: string): Promise<void> {
  await apiFetch(`/api/documentos/${documentoId}/visualizado`, { method: 'POST' });
}

export async function getNotificacoesDocumentos(
  since?: string
): Promise<DocumentNotificacaoResponse> {
  const qs = since ? `?since=${encodeURIComponent(since)}` : '';
  return apiFetch(`/api/notificacoes/documentos${qs}`);
}

export async function uploadDocumento(
  plantaoId: string,
  file: File,
  titulo: string,
  descricao?: string
): Promise<UploadDocumentoResponse> {
  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('titulo', titulo);
  if (descricao) formData.append('descricao', descricao);

  return apiFetch<UploadDocumentoResponse>(`/api/plantoes/${plantaoId}/documentos`, {
    method: 'POST',
    body: formData,
    // não definir Content-Type para o browser setar multipart com boundary
  });
}
