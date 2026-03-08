import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Plantao } from '@plantao/shared';

async function fetchPlantoes(): Promise<Plantao[]> {
  const { data } = await axios.get<{ plantoes: Plantao[] }>('/api/plantoes');
  return data.plantoes;
}

export function usePlantoes() {
  return useQuery({
    queryKey: ['plantoes'],
    queryFn: fetchPlantoes,
    staleTime: 30_000,
  });
}
