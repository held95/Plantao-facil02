'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      toast.success(
        data.message ||
          'Se a conta existir e estiver aprovada, enviaremos um email de redefinicao.'
      );
    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      toast.error('Nao foi possivel processar sua solicitacao.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Mail className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Esqueceu a senha?</h1>
            <p className="text-sm text-gray-500 mt-1">
              Informe seu email para receber instrucoes de redefinicao.
            </p>
          </div>
        </CardHeader>

        <CardContent>
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isLoading ? 'Enviando...' : 'Enviar email de redefinicao'}
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

