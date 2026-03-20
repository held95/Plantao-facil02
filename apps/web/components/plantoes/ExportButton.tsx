'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table2 } from 'lucide-react';

export function ExportButton() {
  const [open, setOpen] = useState(false);

  const handleExport = (format: 'csv' | 'html') => {
    const url = `/api/plantoes/export?format=${format}`;
    if (format === 'html') {
      window.open(url, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'escala-plantoes.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="border-gray-300"
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => handleExport('csv')}
            >
              <Table2 className="h-4 w-4 text-green-600" />
              Exportar CSV
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => handleExport('html')}
            >
              <FileText className="h-4 w-4 text-blue-600" />
              Imprimir / PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
