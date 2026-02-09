'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { CalendarGrid } from '@/components/calendario/CalendarGrid';
import { FilterPanel } from '@/components/calendario/FilterPanel';
import { StatusLegend } from '@/components/calendario/StatusLegend';
import {
  getMonthNameCapitalized,
  getPreviousMonth,
  getNextMonth,
  getTodayMidnight,
} from '@/lib/utils/calendar';
import { filterPlantoesByLocal, filterPlantoesByStatus } from '@/lib/utils/filters';
import { getStatusDisplay } from '@/lib/utils/status';
import { mockPlantoes } from '@/lib/data/mockPlantoes';

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localFilter, setLocalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Add statusDisplay to plantões
  const plantoesWithStatus = mockPlantoes.map((plantao) => ({
    ...plantao,
    statusDisplay: getStatusDisplay(plantao),
  }));

  // Apply filters
  let filteredPlantoes = plantoesWithStatus;
  filteredPlantoes = filterPlantoesByLocal(filteredPlantoes, localFilter);
  filteredPlantoes = filterPlantoesByStatus(filteredPlantoes, statusFilter);

  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleClearFilters = () => {
    setLocalFilter('');
    setStatusFilter('todos');
  };

  const handleDayClick = (date: Date) => {
    // TODO: Show plantões for selected date in a modal or sidebar
    console.log('Selected date:', date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Calendário de Plantões
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Visualize todos os plantões em um calendário
            </p>
          </div>
          <Button variant="outline" onClick={handleToday}>
            Hoje
          </Button>
        </div>

        {/* Filters */}
        <FilterPanel
          localFilter={localFilter}
          statusFilter={statusFilter}
          onLocalFilterChange={setLocalFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Status Legend */}
        <div className="my-6">
          <StatusLegend />
        </div>

        {/* Month Navigation */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <h2 className="min-w-[200px] text-center text-2xl font-semibold text-gray-900">
            {getMonthNameCapitalized(currentMonth)}
          </h2>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid
          currentMonth={currentMonth}
          plantoes={filteredPlantoes}
          onDayClick={handleDayClick}
        />
      </div>
    </div>
  );
}
