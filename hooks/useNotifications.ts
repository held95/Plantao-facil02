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
  const { setNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll a cada 30 segundos
    refetchOnWindowFocus: true,
    staleTime: 25000,
  });

  // Atualizar store quando dados mudam
  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data, setNotifications]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      // Optimistic update no store local
      markAsRead(id);
    },
    onError: () => {
      toast.error('Erro ao marcar notificação como lida');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => {
      // Optimistic update no store local
      markAllAsRead();
    },
    onSuccess: () => {
      toast.success('Todas as notificações foram marcadas como lidas');
    },
    onError: () => {
      toast.error('Erro ao marcar todas as notificações');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
