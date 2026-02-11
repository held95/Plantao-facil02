'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.success('Login realizado com sucesso!');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-slate-100 overflow-hidden">
            <img
              src="/logos/logo-main.png"
              alt="ProTime Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plantão Fácil</h1>
            <p className="text-base text-gray-600">Faça login para continuar</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-slate-600 transition-colors"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="flex items-center justify-between text-sm pt-2">
            <Link
              href="/forgot-password"
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline transition-colors"
            >
              Esqueceu a senha?
            </Link>
            <Link
              href="/signup"
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline transition-colors"
            >
              Criar conta
            </Link>
          </div>

          {/* Security Note */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              🔒 Seus dados estão protegidos e seguros
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
