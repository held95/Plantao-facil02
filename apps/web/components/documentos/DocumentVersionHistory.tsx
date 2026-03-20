'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, History, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PlantaoDocumento } from '@plantao/shared';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface DocumentVersionHistoryProps {
  documentoId: string;
  titulo: string;
  onClose: () => void;
}

async function fetchVersions(documentoId: string): Promise<PlantaoDocumento[]> {
  const res = await fetch(`${BASE}/api/documentos/${documentoId}/versoes`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.versoes ?? [];
}

export function DocumentVersionHistory({
  documentoId,
  titulo,
  onClose,
}: DocumentVersionHistoryProps) {
  const { data: versoes = [], isLoading } = useQuery({
    queryKey: ['documentos', 'versoes', documentoId],
    queryFn: () => fetchVersions(documentoId),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historico de Versoes
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 mb-3 truncate">{titulo}</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : versoes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Nenhuma versao anterior encontrada.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {versoes
              .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
              .map((v) => (
                <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {v.titulo}
                      </span>
                      {v.version !== undefined && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs py-0 px-1.5 h-4">
                          v{v.version}
                        </Badge>
                      )}
                      {v.status === 'versao_anterior' && (
                        <Badge className="bg-gray-100 text-gray-600 text-xs py-0 px-1.5 h-4">
                          Anterior
                        </Badge>
                      )}
                      {v.status === 'ativo' && (
                        <Badge className="bg-green-100 text-green-700 text-xs py-0 px-1.5 h-4">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(v.uploadedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {v.uploadedByNome && ` por ${v.uploadedByNome}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
