'use client';

import { MapPin, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface FilterPanelProps {
  localFilter: string;
  statusFilter: string;
  onLocalFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  localFilter,
  statusFilter,
  onLocalFilterChange,
  onStatusFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const statusOptions = [
    { label: 'Todos os Status', value: 'todos' },
    { label: '🟢 Aberto', value: 'aberto' },
    { label: '🔵 Futuro', value: 'futuro' },
    { label: '⚫ Fechado', value: 'fechado' },
  ];

  const hasActiveFilters = localFilter !== '' || statusFilter !== 'todos';

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <span className="ml-auto rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            Ativos
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Local Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="h-4 w-4 text-gray-500" />
            Local
          </label>
          <div className="relative">
            <Input
              placeholder="Ex: Hospital Central..."
              value={localFilter}
              onChange={(e) => onLocalFilterChange(e.target.value)}
              className="pl-3 transition-shadow focus:shadow-md"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter className="h-4 w-4 text-gray-500" />
            Status
          </label>
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={statusOptions}
            className="transition-shadow focus:shadow-md"
          />
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {localFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              <MapPin className="h-3 w-3" />
              {localFilter}
              <button
                onClick={() => onLocalFilterChange('')}
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'todos' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              <Filter className="h-3 w-3" />
              {statusOptions.find((opt) => opt.value === statusFilter)?.label}
              <button
                onClick={() => onStatusFilterChange('todos')}
                className="ml-1 hover:text-purple-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
