import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api/notifications';
import { useNotificationStore } from '@/stores/notificationStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll a cada 30 segundos
    refetchOnWindowFocus: true,
    staleTime: 25000,
  });

  // Atualizar contador de não lidas quando dados mudam
  useEffect(() => {
    if (data) {
      const unreadCount = data.filter(n => !n.lida).length;
      setUnreadCount(unreadCount);
    }
  }, [data, setUnreadCount]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidar query para recarregar notificações
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Erro ao marcar notificação como lida');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      toast.success('Todas as notificações foram marcadas como lidas');
      // Invalidar query para recarregar notificações
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Erro ao marcar todas as notificações');
    },
  });

  return {
    notifications: data || [],
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
