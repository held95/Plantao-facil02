'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      toast.error('As senhas nao conferem.');
      return;
    }
    if (form.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          senha: form.senha,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar conta.');
        return;
      }

      toast.success(
        'Cadastro enviado. Sua conta esta pendente de aprovacao manual da equipe.'
      );
      router.push('/login');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro de conexao. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-slate-100 overflow-hidden">
            <img
              src="/logos/logo-main.png"
              alt="Plantao Facil"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
            <p className="text-sm text-gray-500 mt-1">
              Cadastro rapido para acesso ao Plantao Facil
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <UserPlus className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Dados de acesso
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email de login <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Min. 6 caracteres"
                    value={form.senha}
                    onChange={(e) => set('senha', e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirmar <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Repita a senha"
                    value={form.confirmarSenha}
                    onChange={(e) => set('confirmarSenha', e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-sm text-slate-700">
                Ao concluir, sua conta ficara <strong>pendente de aprovacao manual</strong>.
                Depois da aprovacao, voce recebera um email de confirmacao.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isLoading ? 'Enviando cadastro...' : 'Criar conta'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Ja tem conta? </span>
              <Link href="/login" className="text-slate-700 font-semibold hover:underline">
                Fazer login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

