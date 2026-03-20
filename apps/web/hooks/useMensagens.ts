'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMensagensStore } from '@/stores/mensagensStore';
import { toast } from 'sonner';
import type { Mensagem } from '@plantao/backend';

async function fetchMensagens(): Promise<{ recebidas: Mensagem[]; enviadas: Mensagem[] }> {
  const res = await fetch('/api/mensagens');
  if (!res.ok) throw new Error('Erro ao buscar mensagens');
  return res.json();
}

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch('/api/mensagens/nao-lidas');
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

async function fetchUsuarios(): Promise<{ id: string; nome: string; email: string; role: string }[]> {
  const res = await fetch('/api/mensagens/usuarios');
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  const data = await res.json();
  return data.usuarios;
}

export function useMensagens() {
  return useQuery({
    queryKey: ['mensagens'],
    queryFn: fetchMensagens,
    staleTime: 20000,
  });
}

export function useMensagensUnreadCount() {
  const { setUnreadCount } = useMensagensStore();

  const { data } = useQuery({
    queryKey: ['mensagens-nao-lidas'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 25000,
  });

  useEffect(() => {
    if (data !== undefined) setUnreadCount(data);
  }, [data, setUnreadCount]);
}

export function useMensagensUsuarios() {
  return useQuery({
    queryKey: ['mensagens-usuarios'],
    queryFn: fetchUsuarios,
    staleTime: 60000,
  });
}

export function useSendMensagem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/mensagens', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao enviar mensagem');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Mensagem enviada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['mensagens'] });
      queryClient.invalidateQueries({ queryKey: ['mensagens-nao-lidas'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar mensagem');
    },
  });
}

export function useDeleteMensagens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) => fetch(`/api/mensagens/${id}`, { method: 'DELETE' }))
      );
    },
    onSuccess: () => {
      toast.success('Mensagem(ns) excluída(s)');
      queryClient.invalidateQueries({ queryKey: ['mensagens'] });
      queryClient.invalidateQueries({ queryKey: ['mensagens-nao-lidas'] });
    },
    onError: () => {
      toast.error('Erro ao excluir mensagens');
    },
  });
}

export function useMarkMensagemAsRead() {
  const queryClient = useQueryClient();
  const { decrementUnreadCount } = useMensagensStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mensagens/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Erro ao marcar como lida');
    },
    onSuccess: () => {
      decrementUnreadCount();
      queryClient.invalidateQueries({ queryKey: ['mensagens'] });
      queryClient.invalidateQueries({ queryKey: ['mensagens-nao-lidas'] });
    },
  });
}
