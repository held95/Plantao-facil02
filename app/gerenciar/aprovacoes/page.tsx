'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

type PendingUser = {
  id: string;
  email: string;
  nome: string;
  role: string;
  status: 'pendente_aprovacao' | 'aprovado' | 'rejeitado';
  createdAt: string;
};

export default function AprovacoesPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const canApprove =
    session?.user?.role === 'admin' || session?.user?.role === 'coordenador';

  const loadPendingUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pending-users');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao buscar usuarios pendentes.');
        return;
      }
      setUsers(data.users || []);
    } catch (error) {
      console.error('Erro ao carregar pendentes:', error);
      toast.error('Erro de conexao ao carregar pendencias.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setActionUserId(userId);
    try {
      const res = await fetch(`/api/admin/pending-users/${userId}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Nao foi possivel concluir a acao.');
        return;
      }

      toast.success(
        action === 'approve'
          ? 'Conta aprovada com sucesso.'
          : 'Conta rejeitada com sucesso.'
      );
      setUsers((current) => current.filter((u) => u.id !== userId));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro de conexao ao atualizar status.');
    } finally {
      setActionUserId(null);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && canApprove) {
      loadPendingUsers();
    } else if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status, canApprove]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aprovacao de contas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Aprove ou rejeite novos cadastros pendentes.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loadPendingUsers}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {!canApprove && status === 'authenticated' && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">
                Voce nao tem permissao para aprovar cadastros.
              </p>
            </CardContent>
          </Card>
        )}

        {canApprove && (
          <div className="space-y-4">
            {isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Carregando pendencias...</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && users.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Nenhum cadastro pendente no momento.</p>
                </CardContent>
              </Card>
            )}

            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {user.nome || 'Novo usuario'}
                      </h2>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant="secondary">Pendente</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                      Solicitado em {new Date(user.createdAt).toLocaleString('pt-BR')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => handleAction(user.id, 'reject')}
                        disabled={actionUserId === user.id}
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </Button>
                      <Button
                        type="button"
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAction(user.id, 'approve')}
                        disabled={actionUserId === user.id}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

