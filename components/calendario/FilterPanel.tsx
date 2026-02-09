'use client';

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
    { label: 'Todos', value: 'todos' },
    { label: 'Aberto', value: 'aberto' },
    { label: 'Futuro', value: 'futuro' },
    { label: 'Fechado', value: 'fechado' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Local Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Local</label>
          <Input
            placeholder="Filtrar por local..."
            value={localFilter}
            onChange={(e) => onLocalFilterChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Status</label>
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={statusOptions}
          />
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
