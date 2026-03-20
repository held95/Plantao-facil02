'use client';

import { useState } from 'react';
import { FileText, Eye, Clock, Archive, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useArquivarDocumento } from '@/hooks/useArquivarDocumento';
import { DocumentVersionHistory } from './DocumentVersionHistory';
import { toast } from 'sonner';
import type { PlantaoDocumentoComLeitura } from '@plantao/shared';

interface DocumentCardProps {
  documento: PlantaoDocumentoComLeitura;
  onView: (documento: PlantaoDocumentoComLeitura) => void;
  canArchive?: boolean;
  plantaoId?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({ documento, onView, canArchive, plantaoId }: DocumentCardProps) {
  const arquivar = useArquivarDocumento(plantaoId);
  const [showHistory, setShowHistory] = useState(false);

  const handleArquivar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await arquivar.mutateAsync(documento.id);
      toast.success('Documento arquivado.');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao arquivar documento');
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${
        !documento.lido ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
      }`}
      onClick={() => onView(documento)}
    >
      <div className="shrink-0 mt-0.5">
        <div className={`p-2 rounded-lg ${!documento.lido ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <FileText className={`h-5 w-5 ${!documento.lido ? 'text-blue-600' : 'text-gray-500'}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-sm text-gray-900 truncate">{documento.titulo}</p>
          {!documento.lido && (
            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" aria-label="Não lido" />
          )}
          {documento.status === 'arquivado' && (
            <Badge className="bg-gray-100 text-gray-600 text-xs py-0 px-1.5 h-4">Arquivado</Badge>
          )}
        </div>

        {documento.descricao && (
          <p className="text-xs text-gray-500 truncate mb-1">{documento.descricao}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(documento.uploadedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          <span>{formatBytes(documento.tamanhoBytes)}</span>
          {documento.uploadedByNome && (
            <span className="truncate">por {documento.uploadedByNome}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {canArchive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Historico de versoes"
            onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
          >
            <History className="h-4 w-4 text-gray-400 hover:text-blue-500" />
          </Button>
        )}
        {canArchive && documento.status === 'ativo' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Arquivar documento"
            onClick={handleArquivar}
            disabled={arquivar.isPending}
          >
            <Archive className="h-4 w-4 text-gray-400 hover:text-orange-500" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Visualizar documento"
          onClick={(e) => { e.stopPropagation(); onView(documento); }}
        >
          <Eye className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {showHistory && (
        <div onClick={(e) => e.stopPropagation()}>
          <DocumentVersionHistory
            documentoId={documento.id}
            titulo={documento.titulo}
            onClose={() => setShowHistory(false)}
          />
        </div>
      )}
    </div>
  );
}
