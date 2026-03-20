import { useQuery } from '@tanstack/react-query';
import { getDocumentosByPlantao } from '@/lib/api/documentos';

export interface DocumentoFilters {
  q?: string;
  desde?: string;
  ate?: string;
  includeArchived?: boolean;
}

export function useDocumentosByPlantao(plantaoId: string, filters?: DocumentoFilters) {
  return useQuery({
    queryKey: ['documentos', 'plantao', plantaoId, filters],
    queryFn: () => getDocumentosByPlantao(plantaoId, filters),
    enabled: !!plantaoId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
