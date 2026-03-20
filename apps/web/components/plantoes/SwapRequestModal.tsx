'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeftRight } from 'lucide-react';
import { useProposeSwap } from '@/hooks/useSwapRequests';
import { toast } from 'sonner';

interface SwapRequestModalProps {
  plantaoOrigemId: string;
  onClose: () => void;
}

export function SwapRequestModal({ plantaoOrigemId, onClose }: SwapRequestModalProps) {
  const [destinatarioId, setDestinatarioId] = useState('');
  const [plantaoDestinoId, setPlantaoDestinoId] = useState('');
  const proposeSwap = useProposeSwap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinatarioId.trim() || !plantaoDestinoId.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await proposeSwap.mutateAsync({
        plantaoOrigemId,
        destinatarioId: destinatarioId.trim(),
        plantaoDestinoId: plantaoDestinoId.trim(),
      });
      toast.success('Proposta de troca enviada com sucesso!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao enviar proposta de troca');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Propor Troca de Plantao
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do medico destinatario <span className="text-red-500">*</span>
            </label>
            <Input
              value={destinatarioId}
              onChange={(e) => setDestinatarioId(e.target.value)}
              placeholder="ID do medico com quem deseja trocar"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              O ID do medico pode ser encontrado no perfil ou na lista de inscricoes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do plantao destino <span className="text-red-500">*</span>
            </label>
            <Input
              value={plantaoDestinoId}
              onChange={(e) => setPlantaoDestinoId(e.target.value)}
              placeholder="ID do plantao que deseja receber"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              O ID do plantao aparece na URL da pagina do plantao.
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-700">
              Ao propor a troca, o outro medico recebera uma notificacao para aceitar ou rejeitar.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={proposeSwap.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={proposeSwap.isPending}
            >
              {proposeSwap.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Propor Troca
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
