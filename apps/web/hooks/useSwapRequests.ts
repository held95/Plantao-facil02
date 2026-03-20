import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SwapRequest } from '@plantao/shared';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, { ...options, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useSwapRequestsByPlantao(plantaoId: string) {
  return useQuery<SwapRequest[]>({
    queryKey: ['swaps', 'plantao', plantaoId],
    queryFn: async () => {
      const data = await apiFetch<{ swaps: SwapRequest[] }>(`/api/plantoes/${plantaoId}/swap`);
      return data.swaps;
    },
    enabled: !!plantaoId,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useSwapRequestsByUser(userId: string) {
  return useQuery<SwapRequest[]>({
    queryKey: ['swaps', 'user', userId],
    queryFn: async () => {
      const data = await apiFetch<{ swaps: SwapRequest[] }>(`/api/swap/user`);
      return data.swaps;
    },
    enabled: !!userId,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useAceitarSwap(plantaoId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (swapId: string) =>
      apiFetch(`/api/swap/${swapId}/aceitar`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      if (plantaoId) {
        queryClient.invalidateQueries({ queryKey: ['swaps', 'plantao', plantaoId] });
      }
    },
  });
}

export function useRejeitarSwap(plantaoId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (swapId: string) =>
      apiFetch(`/api/swap/${swapId}/rejeitar`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      if (plantaoId) {
        queryClient.invalidateQueries({ queryKey: ['swaps', 'plantao', plantaoId] });
      }
    },
  });
}

export function useProposeSwap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      plantaoOrigemId,
      destinatarioId,
      plantaoDestinoId,
    }: {
      plantaoOrigemId: string;
      destinatarioId: string;
      plantaoDestinoId: string;
    }) =>
      apiFetch(`/api/plantoes/${plantaoOrigemId}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinatarioId, plantaoDestinoId }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['swaps', 'plantao', variables.plantaoOrigemId] });
    },
  });
}
