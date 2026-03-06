export type StatusDisplay = 'aberto' | 'futuro' | 'fechado';

export interface PlantaoStatus {
  data: string;
  vagas?: number;
  inscritos?: number;
  status?: string;
  [key: string]: any;
}

export function getStatusDisplay(plantao: PlantaoStatus): StatusDisplay {
  const plantaoDate = new Date(plantao.data);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (plantaoDate < today) return 'fechado';

  if (plantao.status) {
    const status = plantao.status.toLowerCase();
    if (status === 'fechado' || status === 'cancelado') return 'fechado';
  }

  if (plantao.vagas !== undefined && plantao.inscritos !== undefined) {
    if (plantao.inscritos >= plantao.vagas) return 'fechado';
  }

  const daysDifference = Math.floor(
    (plantaoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDifference <= 7) return 'aberto';
  return 'futuro';
}

export function getStatusColor(status: StatusDisplay): string {
  const colors: Record<StatusDisplay, string> = {
    aberto: 'bg-green-100 text-green-700 border-green-200',
    futuro: 'bg-blue-100 text-blue-700 border-blue-200',
    fechado: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || colors.fechado;
}

export function getStatusLabel(status: StatusDisplay): string {
  const labels: Record<StatusDisplay, string> = {
    aberto: 'Aberto',
    futuro: 'Futuro',
    fechado: 'Fechado',
  };
  return labels[status] || 'Desconhecido';
}

export function getStatusDotColor(status: StatusDisplay): string {
  const colors: Record<StatusDisplay, string> = {
    aberto: 'bg-green-500',
    futuro: 'bg-blue-500',
    fechado: 'bg-gray-400',
  };
  return colors[status] || colors.fechado;
}
