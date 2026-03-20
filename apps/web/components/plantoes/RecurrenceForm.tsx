'use client';

import type { RecurrenceRule } from '@plantao/shared';

interface RecurrenceFormProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function RecurrenceForm({
  value,
  onChange,
  enabled,
  onEnabledChange,
}: RecurrenceFormProps) {
  const handleFrequencyChange = (frequency: RecurrenceRule['frequency']) => {
    onChange({ frequency, occurrences: value?.occurrences ?? 4 });
  };

  const handleOccurrencesChange = (occurrences: number) => {
    onChange({ frequency: value?.frequency ?? 'semanal', occurrences });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            onEnabledChange(e.target.checked);
            if (e.target.checked && !value) {
              onChange({ frequency: 'semanal', occurrences: 4 });
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">
          Criar plantao recorrente
        </span>
      </label>

      {enabled && (
        <div className="ml-6 space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequencia
            </label>
            <select
              value={value?.frequency ?? 'semanal'}
              onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceRule['frequency'])}
              className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semanal">Semanal (toda semana)</option>
              <option value="mensal">Mensal (todo mes)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero de ocorrencias
            </label>
            <input
              type="number"
              min={2}
              max={52}
              value={value?.occurrences ?? 4}
              onChange={(e) => handleOccurrencesChange(parseInt(e.target.value, 10) || 4)}
              className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimo 2, maximo 52 ocorrencias.
            </p>
          </div>

          <p className="text-xs text-blue-700">
            Serao criados {value?.occurrences ?? 4} plantoes {value?.frequency === 'mensal' ? 'mensais' : 'semanais'} a partir da data informada.
          </p>
        </div>
      )}
    </div>
  );
}
