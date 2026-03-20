import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marcarComoVisualizado } from '@/lib/api/documentos';
import { toast } from 'sonner';

export function useMarkDocumentoAsViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcarComoVisualizado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', 'documentos'] });
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
    },
    onError: () => {
      toast.error('Erro ao marcar documento como lido');
    },
  });
}
