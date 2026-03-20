import { useQuery } from '@tanstack/react-query';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface AnalyticsData {
  plantoes: {
    total: number;
    disponiveis: number;
    preenchidos: number;
    cancelados: number;
  };
  usuarios: {
    total: number;
    medicos: number;
    coordenadores: number;
  };
  documentos: {
    total: number;
  };
  coberturaHospitais: Array<{
    hospital: string;
    total: number;
    preenchidos: number;
    taxaCobertura: number;
  }>;
  byEspecialidade: Record<string, number>;
}

export function useAdminAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/analytics`, { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60, // 60s
  });
}
