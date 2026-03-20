'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Loader2, Search, Archive } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { DocumentUploadModal } from './DocumentUploadModal';
import { PDFViewer } from './PDFViewer';
import { useDocumentosByPlantao } from '@/hooks/useDocumentosByPlantao';
import { useMarkDocumentoAsViewed } from '@/hooks/useMarkDocumentoAsViewed';
import { getDocumentoById } from '@/lib/api/documentos';
import { toast } from 'sonner';
import type { PlantaoDocumentoComLeitura } from '@plantao/shared';

interface DocumentListProps {
  plantaoId: string;
  canUpload: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null };

  const update = useCallback(
    (val: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDebounced(val), delay);
    },
    [delay]
  );

  return debounced;
}

export function DocumentList({ plantaoId, canUpload }: DocumentListProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitulo, setViewerTitulo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => setDebouncedSearch(val), 300);
      return () => clearTimeout(timer);
    }
  };

  const filters = {
    q: debouncedSearch || undefined,
    desde: desde || undefined,
    ate: ate || undefined,
    includeArchived,
  };

  const { data: documentos, isLoading } = useDocumentosByPlantao(plantaoId, filters);
  const markAsViewed = useMarkDocumentoAsViewed();

  const handleView = async (doc: PlantaoDocumentoComLeitura) => {
    try {
      const { downloadUrl } = await getDocumentoById(doc.id);
      setViewerUrl(downloadUrl);
      setViewerTitulo(doc.titulo);
      if (!doc.lido) {
        markAsViewed.mutate(doc.id);
      }
    } catch {
      toast.error('Erro ao abrir documento');
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {canUpload && (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Enviar Documento
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Buscar documentos..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-7 h-8 text-sm w-44"
            />
          </div>

          {/* Date range */}
          <Input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="h-8 text-sm w-36"
            title="Data inicio"
          />
          <Input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            className="h-8 text-sm w-36"
            title="Data fim"
          />

          {/* Archived toggle */}
          <Button
            variant={includeArchived ? 'default' : 'outline'}
            size="sm"
            className={`h-8 ${includeArchived ? 'bg-gray-700 hover:bg-gray-800' : ''}`}
            onClick={() => setIncludeArchived((v) => !v)}
          >
            <Archive className="h-3.5 w-3.5 mr-1" />
            {includeArchived ? 'Ocultar arquivados' : 'Mostrar arquivados'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">
          <Loader2 className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-2" />
          <p className="text-sm text-gray-500">Carregando documentos...</p>
        </div>
      ) : !documentos || documentos.length === 0 ? (
        <div className="py-10 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum documento disponivel para este plantao</p>
          {canUpload && (
            <p className="text-gray-400 text-xs mt-1">
              Clique em "Enviar Documento" para adicionar o primeiro.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {documentos.map((doc) => (
            <DocumentCard
              key={doc.id}
              documento={doc}
              onView={handleView}
              canArchive={canUpload}
              plantaoId={plantaoId}
            />
          ))}
        </div>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          plantaoId={plantaoId}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {viewerUrl && (
        <PDFViewer
          downloadUrl={viewerUrl}
          titulo={viewerTitulo}
          onClose={() => setViewerUrl(null)}
        />
      )}
    </div>
  );
}
