import { getMonthDays, getWeekDays } from '@/lib/utils/calendar';
import { CalendarDay } from './CalendarDay';
import type { StatusDisplay } from '@/lib/utils/status';

export interface Plantao {
  id: string;
  data: string;
  statusDisplay: StatusDisplay;
  [key: string]: any;
}

export interface CalendarGridProps {
  currentMonth: Date;
  plantoes: Plantao[];
  onDayClick?: (date: Date) => void;
}

export function CalendarGrid({
  currentMonth,
  plantoes,
  onDayClick,
}: CalendarGridProps) {
  const monthDays = getMonthDays(currentMonth);
  const weekDays = getWeekDays();

  // Group plantões by date for efficient lookup
  const plantoesByDate = plantoes.reduce((acc, plantao) => {
    const dateKey = new Date(plantao.data).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(plantao);
    return acc;
  }, {} as Record<string, Plantao[]>);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((date, index) => {
          const dateKey = date.toDateString();
          const dayPlantoes = plantoesByDate[dateKey] || [];

          return (
            <CalendarDay
              key={index}
              date={date}
              currentMonth={currentMonth}
              plantoes={dayPlantoes}
              onClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
