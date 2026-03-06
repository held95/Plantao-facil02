// Date formatting utilities with Brazilian (pt-BR) locale support
import { format, parseISO, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export function parseDate(brDate: string): Date | null {
  try {
    const date = parse(brDate, 'dd/MM/yyyy', new Date(), { locale: ptBR });
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

export function parseDateTime(brDateTime: string): Date | null {
  try {
    const date = parse(brDateTime, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date-time:', error);
    return null;
  }
}

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

export function getStartAndEndOfDay(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
