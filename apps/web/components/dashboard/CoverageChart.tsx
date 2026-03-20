'use client';

interface CoverageItem {
  hospital: string;
  total: number;
  preenchidos: number;
  taxaCobertura: number;
}

interface CoverageChartProps {
  data: CoverageItem[];
}

export function CoverageChart({ data }: CoverageChartProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Nenhum dado disponivel.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.hospital}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-700 truncate max-w-[60%]" title={item.hospital}>
              {item.hospital}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {item.taxaCobertura}%
              <span className="text-xs text-gray-400 ml-1">
                ({item.preenchidos}/{item.total})
              </span>
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${item.taxaCobertura}%`,
                backgroundColor:
                  item.taxaCobertura >= 80
                    ? '#16a34a'
                    : item.taxaCobertura >= 50
                    ? '#d97706'
                    : '#dc2626',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
