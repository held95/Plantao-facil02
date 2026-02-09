import { Circle, Info } from 'lucide-react';

export function StatusLegend() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-white via-gray-50/30 to-white p-5 shadow-sm">
      <div className="flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Legenda:</span>
        </div>

        <div className="flex items-center gap-2 group cursor-help">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 ring-2 ring-green-200 transition-transform group-hover:scale-110">
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          </div>
          <span className="text-sm font-semibold text-green-700">Aberto</span>
        </div>

        <div className="flex items-center gap-2 group cursor-help">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200 transition-transform group-hover:scale-110">
            <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-blue-700">Futuro</span>
        </div>

        <div className="flex items-center gap-2 group cursor-help">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-2 ring-gray-200 transition-transform group-hover:scale-110">
            <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Fechado</span>
        </div>
      </div>
    </div>
  );
}
