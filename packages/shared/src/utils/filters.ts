/**
 * Filter utilities for plantões and other entities
 */

export interface PlantaoFilter {
  id: string;
  titulo?: string;
  hospital: string;
  local?: string;
  status: string;
  data: string;
  descricao?: string;
  statusDisplay?: 'aberto' | 'futuro' | 'fechado';
  [key: string]: any;
}

export function filterPlantoesByStatus<T extends PlantaoFilter>(
  plantoes: T[],
  status: string
): T[] {
  if (!status || status === 'todos') return plantoes;
  return plantoes.filter((plantao) => {
    const plantaoStatus = plantao.statusDisplay || plantao.status;
    return plantaoStatus.toLowerCase() === status.toLowerCase();
  });
}

export function filterPlantoesByLocal<T extends PlantaoFilter>(
  plantoes: T[],
  local: string
): T[] {
  if (!local || local === 'todos') return plantoes;
  return plantoes.filter((plantao) => {
    const plantaoLocal = plantao.local || plantao.hospital;
    return plantaoLocal?.toLowerCase().includes(local.toLowerCase());
  });
}

export function filterPlantoesByDateRange<T extends PlantaoFilter>(
  plantoes: T[],
  startDate?: Date,
  endDate?: Date
): T[] {
  if (!startDate && !endDate) return plantoes;
  return plantoes.filter((plantao) => {
    const plantaoDate = new Date(plantao.data);
    if (startDate && plantaoDate < startDate) return false;
    if (endDate && plantaoDate > endDate) return false;
    return true;
  });
}

export function getUniqueLocations<T extends PlantaoFilter>(plantoes: T[]): string[] {
  const locations = plantoes.map((plantao) => plantao.local || plantao.hospital);
  const unique = Array.from(new Set(locations)).filter(Boolean);
  return unique.sort();
}

export function sortPlantoesByDate<T extends PlantaoFilter>(
  plantoes: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...plantoes].sort((a, b) => {
    const dateA = new Date(a.data).getTime();
    const dateB = new Date(b.data).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

export function searchPlantoes<T extends PlantaoFilter>(
  plantoes: T[],
  searchTerm: string
): T[] {
  if (!searchTerm || searchTerm.trim() === '') return plantoes;
  const term = searchTerm.toLowerCase().trim();
  return plantoes.filter((plantao) => {
    const searchableText = [plantao.titulo, plantao.hospital, plantao.local, plantao.descricao]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return searchableText.includes(term);
  });
}
