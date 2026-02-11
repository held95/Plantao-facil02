// Date formatting utilities with Brazilian (pt-BR) locale support
import { format, parseISO, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format ISO date string to Brazilian format (DD/MM/YYYY)
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string
 */
export function formatDate(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'Data inválida';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
}

/**
 * Format ISO date string to Brazilian format with time (DD/MM/YYYY HH:mm)
 * @param isoString - ISO 8601 date string
 * @returns Formatted date-time string
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'Data inválida';
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return 'Data inválida';
  }
}

/**
 * Format ISO date string to relative time (e.g., "há 2 horas", "há 3 dias")
 * @param isoString - ISO 8601 date string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'Data inválida';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `há ${months} ${months > 1 ? 'meses' : 'mês'}`;
    }

    const years = Math.floor(diffDays / 365);
    return `há ${years} ano${years > 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Data inválida';
  }
}

/**
 * Parse Brazilian date format (DD/MM/YYYY) to Date object
 * @param brDate - Brazilian format date string
 * @returns Date object or null if invalid
 */
export function parseDate(brDate: string): Date | null {
  try {
    const date = parse(brDate, 'dd/MM/yyyy', new Date(), { locale: ptBR });
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Parse Brazilian date format with time (DD/MM/YYYY HH:mm) to Date object
 * @param brDateTime - Brazilian format date-time string
 * @returns Date object or null if invalid
 */
export function parseDateTime(brDateTime: string): Date | null {
  try {
    const date = parse(brDateTime, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date-time:', error);
    return null;
  }
}

/**
 * Format date to full Brazilian format (e.g., "5 de fevereiro de 2026")
 * @param isoString - ISO 8601 date string
 * @returns Full format date string
 */
export function formatDateFull(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'Data inválida';
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    console.error('Error formatting full date:', error);
    return 'Data inválida';
  }
}

/**
 * Check if a date string is today
 * @param isoString - ISO 8601 date string
 * @returns Boolean indicating if date is today
 */
export function isToday(isoString: string): boolean {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return false;

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get start and end of day for a date
 * @param date - Date object
 * @returns Object with start and end of day
 */
export function getStartAndEndOfDay(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
