'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { uploadDocumento } from '@/lib/api/documentos';
import { toast } from 'sonner';

interface FileEntry {
  file: File;
  titulo: string;
}

interface DocumentUploadModalProps {
  plantaoId: string;
  onClose: () => void;
}

export function DocumentUploadModal({ plantaoId, onClose }: DocumentUploadModalProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid: FileEntry[] = [];
    for (const f of selected) {
      if (f.type !== 'application/pdf') {
        toast.error(`${f.name}: apenas PDFs sao aceitos`);
        continue;
      }
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`${f.name}: arquivo muito grande (max 20MB)`);
        continue;
      }
      valid.push({ file: f, titulo: f.name.replace(/\.pdf$/i, '') });
    }
    setFileEntries((prev) => [...prev, ...valid]);
    // reset input so same files can be added again if needed
    e.target.value = '';
  };

  const updateTitulo = (index: number, titulo: string) => {
    setFileEntries((prev) => prev.map((e, i) => (i === index ? { ...e, titulo } : e)));
  };

  const removeEntry = (index: number) => {
    setFileEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileEntries.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }
    const invalid = fileEntries.filter((fe) => !fe.titulo.trim());
    if (invalid.length > 0) {
      toast.error('Informe o titulo de todos os arquivos');
      return;
    }

    setLoading(true);
    setProgress({ done: 0, total: fileEntries.length });
    const erros: string[] = [];

    for (let i = 0; i < fileEntries.length; i++) {
      const { file, titulo } = fileEntries[i]!;
      try {
        await uploadDocumento(plantaoId, file, titulo.trim(), descricao.trim() || undefined);
      } catch (err: any) {
        erros.push(`${file.name}: ${err?.message ?? 'erro'}`);
      }
      setProgress({ done: i + 1, total: fileEntries.length });
    }

    queryClient.invalidateQueries({ queryKey: ['documentos', 'plantao', plantaoId] });
    queryClient.invalidateQueries({ queryKey: ['notificacoes', 'documentos'] });

    if (erros.length > 0) {
      toast.error(`${erros.length} arquivo(s) falharam: ${erros.join(', ')}`);
    } else {
      toast.success(`${fileEntries.length} documento(s) enviado(s) com sucesso!`);
      onClose();
    }

    setLoading(false);
    setProgress(null);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar Documento(s)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* File Drop Zone */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Clique para selecionar PDFs</p>
            <p className="text-xs text-gray-400 mt-1">Multiplos arquivos, max 20MB cada</p>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* File entries */}
          {fileEntries.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {fileEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate mb-1">{entry.file.name}</p>
                    <Input
                      value={entry.titulo}
                      onChange={(e) => updateTitulo(idx, e.target.value)}
                      placeholder="Titulo"
                      className="h-7 text-xs"
                      maxLength={120}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(idx)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descricao (opcional, aplicada a todos)
            </label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descricao dos documentos"
              maxLength={300}
            />
          </div>

          {progress && (
            <div className="text-xs text-gray-600 text-center">
              Enviando {progress.done}/{progress.total}...
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading || fileEntries.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar {fileEntries.length > 0 ? `(${fileEntries.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
