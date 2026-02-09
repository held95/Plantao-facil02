import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday as isTodayFns, isSameDay as isSameDayFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Get all days in a month, including padding days from previous/next months
 * to fill the calendar grid (7 columns x 6 rows = 42 days)
 */
export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  // Get all days in the month
  const monthDays = eachDayOfInterval({ start, end });

  // Calculate padding days before (to start on Sunday)
  const firstDayOfWeek = getDay(start);
  const paddingBefore: Date[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const paddingDate = new Date(start);
    paddingDate.setDate(start.getDate() - (firstDayOfWeek - i));
    paddingBefore.push(paddingDate);
  }

  // Calculate padding days after (to complete 42 days grid)
  const totalDays = paddingBefore.length + monthDays.length;
  const paddingAfter: Date[] = [];
  const daysNeeded = 42 - totalDays;
  for (let i = 1; i <= daysNeeded; i++) {
    const paddingDate = new Date(end);
    paddingDate.setDate(end.getDate() + i);
    paddingAfter.push(paddingDate);
  }

  return [...paddingBefore, ...monthDays, ...paddingAfter];
}

/**
 * Get localized month name (e.g., "janeiro 2026")
 */
export function getMonthName(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

/**
 * Get localized month name capitalized (e.g., "Janeiro 2026")
 */
export function getMonthNameCapitalized(date: Date): string {
  const monthName = getMonthName(date);
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isTodayFns(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return isSameDayFns(date1, date2);
}

/**
 * Get weekday names (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
 */
export function getWeekDays(): string[] {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return date.getMonth() === currentDate.getMonth() &&
         date.getFullYear() === currentDate.getFullYear();
}

/**
 * Navigate to previous month
 */
export function getPreviousMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() - 1);
  return newDate;
}

/**
 * Navigate to next month
 */
export function getNextMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + 1);
  return newDate;
}

/**
 * Get today's date with time set to midnight
 */
export function getTodayMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
