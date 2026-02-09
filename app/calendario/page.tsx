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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Calendário de Plantões
            </h1>
            <p className="text-base text-gray-600">
              Visualize e gerencie todos os plantões em um calendário interativo
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleToday}
            className="bg-white shadow-sm hover:shadow-md transition-all hover:bg-blue-50 hover:border-blue-300"
          >
            <span className="mr-2">📅</span>
            Hoje
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel
            localFilter={localFilter}
            statusFilter={statusFilter}
            onLocalFilterChange={setLocalFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Status Legend */}
        <div className="mb-8">
          <StatusLegend />
        </div>

        {/* Month Navigation */}
        <div className="mb-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-md">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            aria-label="Mês anterior"
            className="hover:bg-slate-100 hover:scale-105 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {getMonthNameCapitalized(currentMonth)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPlantoes.length} {filteredPlantoes.length === 1 ? 'plantão' : 'plantões'} {filteredPlantoes.length === 1 ? 'encontrado' : 'encontrados'}
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Próximo mês"
            className="hover:bg-slate-100 hover:scale-105 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-8">
          <CalendarGrid
            currentMonth={currentMonth}
            plantoes={filteredPlantoes}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Helper Text */}
        <div className="text-center text-sm text-gray-500">
          💡 Dica: Clique em um dia para ver os detalhes dos plantões
        </div>
      </div>
    </div>
  );
}
