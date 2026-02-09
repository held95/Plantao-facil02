import { Circle } from 'lucide-react';

export function StatusLegend() {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
        <span className="text-sm text-gray-700">Aberto</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
        <span className="text-sm text-gray-700">Futuro</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
        <span className="text-sm text-gray-700">Fechado</span>
      </div>
    </div>
  );
}
