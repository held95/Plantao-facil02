import { Circle, Clock, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type StatusDisplay = 'aberto' | 'futuro' | 'fechado';

export interface Plantao {
  data: string;
  vagas?: number;
  inscritos?: number;
  status?: string;
  [key: string]: any;
}

/**
 * Determine the visual status of a plantão based on date and availability
 */
export function getStatusDisplay(plantao: Plantao): StatusDisplay {
  const plantaoDate = new Date(plantao.data);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If plantão date has passed, it's closed
  if (plantaoDate < today) {
    return 'fechado';
  }

  // If explicit status is provided
  if (plantao.status) {
    const status = plantao.status.toLowerCase();
    if (status === 'fechado' || status === 'cancelado') {
      return 'fechado';
    }
  }

  // Check if there are available spots
  if (plantao.vagas !== undefined && plantao.inscritos !== undefined) {
    if (plantao.inscritos >= plantao.vagas) {
      return 'fechado'; // No spots available
    }
  }

  // If date is today or soon, it's open
  const daysDifference = Math.floor(
    (plantaoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDifference <= 7) {
    return 'aberto'; // Open for imminent shifts
  }

  // Otherwise it's a future shift
  return 'futuro';
}

/**
 * Get the badge color classes for a status
 */
export function getStatusColor(status: StatusDisplay): string {
  const colors: Record<StatusDisplay, string> = {
    aberto: 'bg-green-100 text-green-700 border-green-200',
    futuro: 'bg-blue-100 text-blue-700 border-blue-200',
    fechado: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return colors[status] || colors.fechado;
}

/**
 * Get the icon component for a status
 */
export function getStatusIcon(status: StatusDisplay): LucideIcon {
  const icons: Record<StatusDisplay, LucideIcon> = {
    aberto: Circle,
    futuro: Clock,
    fechado: XCircle,
  };

  return icons[status] || XCircle;
}

/**
 * Get the human-readable label for a status
 */
export function getStatusLabel(status: StatusDisplay): string {
  const labels: Record<StatusDisplay, string> = {
    aberto: 'Aberto',
    futuro: 'Futuro',
    fechado: 'Fechado',
  };

  return labels[status] || 'Desconhecido';
}

/**
 * Get the dot color for calendar visualization
 */
export function getStatusDotColor(status: StatusDisplay): string {
  const colors: Record<StatusDisplay, string> = {
    aberto: 'bg-green-500',
    futuro: 'bg-blue-500',
    fechado: 'bg-gray-400',
  };

  return colors[status] || colors.fechado;
}
