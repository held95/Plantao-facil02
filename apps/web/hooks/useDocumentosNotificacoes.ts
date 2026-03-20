import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getNotificacoesDocumentos } from '@/lib/api/documentos';
import { useDocumentNotificationStore } from '@/stores/documentNotificationStore';

export function useDocumentosNotificacoes() {
  const { lastCheckedAt, setUnreadCount } = useDocumentNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notificacoes', 'documentos', lastCheckedAt],
    queryFn: () => getNotificacoesDocumentos(lastCheckedAt),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 25000,
  });

  useEffect(() => {
    if (data) {
      setUnreadCount(data.unreadCount);
    }
  }, [data, setUnreadCount]);

  return {
    notificacoes: data?.recentes ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
  };
}
