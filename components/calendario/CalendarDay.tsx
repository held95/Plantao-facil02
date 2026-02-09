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
        'group relative flex min-h-[120px] flex-col items-start border-r border-b border-gray-200 p-3 transition-all duration-200',
        isInCurrentMonth
          ? 'bg-white hover:bg-blue-50/30 hover:shadow-inner'
          : 'bg-gray-50/50 text-gray-400',
        isTodayDate && 'bg-blue-50 ring-2 ring-blue-500 ring-inset',
        hasPlantoes && 'cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-slate-700 focus:z-10'
      )}
    >
      {/* Date Number with Badge for Today */}
      <div className="flex w-full items-start justify-between">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
            isInCurrentMonth ? 'text-gray-900' : 'text-gray-400',
            isTodayDate && 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200',
            !isTodayDate && hasPlantoes && 'group-hover:bg-gray-100'
          )}
        >
          {date.getDate()}
        </div>

        {/* Status Indicator Dots */}
        {hasPlantoes && (
          <div className="flex gap-1">
            {hasAberto && (
              <div
                className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm ring-1 ring-green-200"
                title="Aberto"
              />
            )}
            {hasFuturo && (
              <div
                className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm ring-1 ring-blue-200"
                title="Futuro"
              />
            )}
            {hasFechado && (
              <div
                className="h-2.5 w-2.5 rounded-full bg-gray-400 shadow-sm ring-1 ring-gray-200"
                title="Fechado"
              />
            )}
          </div>
        )}
      </div>

      {/* Plantões Badge */}
      {plantoes.length > 0 && (
        <div className="mt-auto w-full">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              hasAberto && 'bg-green-100 text-green-700 ring-1 ring-green-200',
              !hasAberto && hasFuturo && 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
              !hasAberto && !hasFuturo && hasFechado && 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
            )}
          >
            <span className="font-semibold">{plantoes.length}</span>
            <span>{plantoes.length === 1 ? 'plantão' : 'plantões'}</span>
          </div>
        </div>
      )}

      {/* Empty State - subtle indicator */}
      {!hasPlantoes && isInCurrentMonth && !isTodayDate && (
        <div className="mt-auto w-full text-center text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          •
        </div>
      )}
    </button>
  );
}
