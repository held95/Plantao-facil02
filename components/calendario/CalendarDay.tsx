import { cn } from '@/lib/utils';
import { isToday, isCurrentMonth } from '@/lib/utils/calendar';
import type { StatusDisplay } from '@/lib/utils/status';

export interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  plantoes?: Array<{ id: string; statusDisplay: StatusDisplay }>;
  onClick?: (date: Date) => void;
}

export function CalendarDay({
  date,
  currentMonth,
  plantoes = [],
  onClick,
}: CalendarDayProps) {
  const isInCurrentMonth = isCurrentMonth(date, currentMonth);
  const isTodayDate = isToday(date);
  const hasPlantoes = plantoes.length > 0;

  // Group plantões by status for dot colors
  const hasAberto = plantoes.some((p) => p.statusDisplay === 'aberto');
  const hasFuturo = plantoes.some((p) => p.statusDisplay === 'futuro');
  const hasFechado = plantoes.some((p) => p.statusDisplay === 'fechado');

  return (
    <button
      onClick={() => onClick?.(date)}
      className={cn(
        'relative flex h-24 flex-col items-center justify-start border border-gray-200 p-2 transition-colors',
        isInCurrentMonth
          ? 'bg-white hover:bg-gray-50'
          : 'bg-gray-50 text-gray-400',
        isTodayDate && 'ring-2 ring-blue-500 ring-inset',
        'focus:outline-none focus:ring-2 focus:ring-slate-700'
      )}
    >
      {/* Date Number */}
      <span
        className={cn(
          'text-sm font-medium',
          isInCurrentMonth ? 'text-gray-900' : 'text-gray-400',
          isTodayDate && 'text-blue-600 font-bold'
        )}
      >
        {date.getDate()}
      </span>

      {/* Status Dots */}
      {hasPlantoes && (
        <div className="mt-2 flex gap-1">
          {hasAberto && (
            <div className="h-2 w-2 rounded-full bg-green-500" title="Aberto" />
          )}
          {hasFuturo && (
            <div className="h-2 w-2 rounded-full bg-blue-500" title="Futuro" />
          )}
          {hasFechado && (
            <div className="h-2 w-2 rounded-full bg-gray-400" title="Fechado" />
          )}
        </div>
      )}

      {/* Plantões Count */}
      {plantoes.length > 0 && (
        <span className="mt-auto text-xs text-gray-600">
          {plantoes.length} {plantoes.length === 1 ? 'plantão' : 'plantões'}
        </span>
      )}
    </button>
  );
}
