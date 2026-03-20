import { useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function arquivarDocumento(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/documentos/${id}/arquivar`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}

export function useArquivarDocumento(plantaoId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: arquivarDocumento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      if (plantaoId) {
        queryClient.invalidateQueries({ queryKey: ['documentos', 'plantao', plantaoId] });
      }
    },
  });
}
