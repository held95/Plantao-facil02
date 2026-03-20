'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { CalendarGrid } from '@/components/calendario/CalendarGrid';
import { FilterPanel } from '@/components/calendario/FilterPanel';
import { StatusLegend } from '@/components/calendario/StatusLegend';
import { PlantaoDetailModal } from '@/components/calendario/PlantaoDetailModal';
import {
  getMonthNameCapitalized,
  getPreviousMonth,
  getNextMonth,
} from '@plantao/shared';
import { filterPlantoesByLocal, filterPlantoesByStatus } from '@plantao/shared';
import { getStatusDisplay } from '@plantao/shared';
import { mockPlantoes } from '@/lib/data/mockPlantoes';
import { usePlantoes } from '@/hooks/usePlantoes';
import { ExportButton } from '@/components/plantoes/ExportButton';

// Parse date string as local time — handles 'YYYY-MM-DD' and ISO formats
function parseDateLocal(dateStr: string): Date {
  const plain = dateStr.split('T')[0];
  const [year, month, day] = plain.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localFilter, setLocalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch plantões from API (real DB)
  const { data: apiData } = usePlantoes();
  const apiPlantoes = apiData ?? [];

  // Combine mock + API plantões (API takes precedence over mock with same id)
  const apiIds = new Set(apiPlantoes.map((p) => p.id));
  const todosPlantoes = [
    ...mockPlantoes.filter((mp) => !apiIds.has(mp.id)),
    ...apiPlantoes,
  ];

  // Add statusDisplay to plantões
  const plantoesWithStatus = todosPlantoes.map((plantao) => ({
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
    setSelectedDate(date);
    setModalOpen(true);
  };

  // Filter plantões for selected date
  const selectedPlantoes = selectedDate
    ? filteredPlantoes.filter((p) => {
        const plantaoDate = parseDateLocal(p.data);
        return plantaoDate.toDateString() === selectedDate.toDateString();
      })
    : [];

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
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              variant="outline"
              onClick={handleToday}
              className="bg-white shadow-sm hover:shadow-md transition-all hover:bg-blue-50 hover:border-blue-300"
            >
              <span className="mr-2">📅</span>
              Hoje
            </Button>
          </div>
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

      {/* Plantão Detail Modal */}
      <PlantaoDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        plantoes={selectedPlantoes}
        selectedDate={selectedDate || new Date()}
      />
    </div>
  );
}
