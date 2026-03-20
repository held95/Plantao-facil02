'use client';

import { ArrowLeftRight, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAceitarSwap, useRejeitarSwap } from '@/hooks/useSwapRequests';
import { toast } from 'sonner';
import type { SwapRequest } from '@plantao/shared';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SwapRequestListProps {
  swaps: SwapRequest[];
  currentUserId: string;
}

function statusBadge(status: SwapRequest['status']) {
  switch (status) {
    case 'pendente':
      return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
    case 'aceito':
      return <Badge className="bg-green-100 text-green-700">Aceito</Badge>;
    case 'rejeitado':
      return <Badge className="bg-red-100 text-red-700">Rejeitado</Badge>;
    case 'cancelado':
      return <Badge className="bg-gray-100 text-gray-700">Cancelado</Badge>;
  }
}

export function SwapRequestList({ swaps, currentUserId }: SwapRequestListProps) {
  const aceitar = useAceitarSwap();
  const rejeitar = useRejeitarSwap();

  if (swaps.length === 0) {
    return (
      <div className="py-8 text-center">
        <ArrowLeftRight className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Nenhuma proposta de troca encontrada</p>
      </div>
    );
  }

  const handleAceitar = async (swapId: string) => {
    try {
      await aceitar.mutateAsync(swapId);
      toast.success('Troca aceita com sucesso!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao aceitar troca');
    }
  };

  const handleRejeitar = async (swapId: string) => {
    try {
      await rejeitar.mutateAsync(swapId);
      toast.success('Troca rejeitada.');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao rejeitar troca');
    }
  };

  return (
    <div className="space-y-3">
      {swaps.map((swap) => {
        const isDestinatario = swap.destinatarioId === currentUserId;
        const canAct = isDestinatario && swap.status === 'pendente';

        return (
          <Card key={swap.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm text-gray-900">
                      {isDestinatario
                        ? `Proposta de ${swap.solicitanteNome}`
                        : `Proposta para ${swap.destinatarioNome}`}
                    </span>
                    {statusBadge(swap.status)}
                  </div>

                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>Plantao origem: <span className="font-mono">{swap.plantaoOrigemId}</span></p>
                    <p>Plantao destino: <span className="font-mono">{swap.plantaoDestinoId}</span></p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(swap.criadoEm), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                {canAct && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-8"
                      onClick={() => handleAceitar(swap.id)}
                      disabled={aceitar.isPending || rejeitar.isPending}
                    >
                      {aceitar.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      <span className="ml-1">Aceitar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 h-8"
                      onClick={() => handleRejeitar(swap.id)}
                      disabled={aceitar.isPending || rejeitar.isPending}
                    >
                      {rejeitar.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span className="ml-1">Rejeitar</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
