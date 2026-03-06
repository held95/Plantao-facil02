import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday as isTodayFns, isSameDay as isSameDayFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const monthDays = eachDayOfInterval({ start, end });

  const firstDayOfWeek = getDay(start);
  const paddingBefore: Date[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const paddingDate = new Date(start);
    paddingDate.setDate(start.getDate() - (firstDayOfWeek - i));
    paddingBefore.push(paddingDate);
  }

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

export function getMonthName(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function getMonthNameCapitalized(date: Date): string {
  const monthName = getMonthName(date);
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}

export function isToday(date: Date): boolean {
  return isTodayFns(date);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return isSameDayFns(date1, date2);
}

export function getWeekDays(): string[] {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
}

export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return date.getMonth() === currentDate.getMonth() &&
         date.getFullYear() === currentDate.getFullYear();
}

export function getPreviousMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() - 1);
  return newDate;
}

export function getNextMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + 1);
  return newDate;
}

export function getTodayMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
