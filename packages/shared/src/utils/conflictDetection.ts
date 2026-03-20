import type { Plantao } from '../types/plantao';

/**
 * Compares two time strings in "HH:MM" format as minutes since midnight.
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Detects if two plantoes have a scheduling conflict.
 * Two plantoes conflict if they share the same date AND their time intervals overlap.
 * Handles overnight shifts (horarioFim < horarioInicio means next-day end).
 */
export function detectScheduleConflict(plantaoA: Plantao, plantaoB: Plantao): boolean {
  if (plantaoA.data !== plantaoB.data) return false;

  const startA = timeToMinutes(plantaoA.horarioInicio);
  let endA = timeToMinutes(plantaoA.horarioFim);
  if (endA <= startA) endA += 24 * 60; // overnight

  const startB = timeToMinutes(plantaoB.horarioInicio);
  let endB = timeToMinutes(plantaoB.horarioFim);
  if (endB <= startB) endB += 24 * 60; // overnight

  // Intervals overlap if start of one is before end of the other and vice versa
  return startA < endB && startB < endA;
}
