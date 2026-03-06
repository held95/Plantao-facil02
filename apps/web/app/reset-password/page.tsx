'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token invalido.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas nao conferem.');
      return;
    }

    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Nao foi possivel redefinir a senha.');
        return;
      }

      toast.success('Senha redefinida com sucesso. Faca login novamente.');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro de conexao. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Lock className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redefinir senha</h1>
            <p className="text-sm text-gray-500 mt-1">
              Crie uma nova senha para sua conta.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Nova senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password-confirm" className="text-sm font-semibold text-gray-700">
                Confirmar senha
              </label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isLoading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-slate-700 font-semibold hover:underline">
                Voltar para login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
