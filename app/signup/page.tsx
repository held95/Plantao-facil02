'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, Bell, Stethoscope } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ESPECIALIDADES = [
  'Clinica Geral', 'Cardiologia', 'Pediatria', 'Ortopedia',
  'Cirurgia Geral', 'Pronto Socorro', 'Ginecologia e Obstetricia',
  'Anestesiologia', 'Neurologia', 'Psiquiatria', 'Outra',
];

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '',
    telefone: '', emailNotificacao: '', crm: '', especialidade: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) {
      toast.error('As senhas nao conferem.');
      return;
    }
    if (form.senha.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone || undefined,
          emailNotificacao: form.emailNotificacao || undefined,
          crm: form.crm || undefined,
          especialidade: form.especialidade || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Conta criada! Faca login para continuar.');
        router.push('/login');
      } else {
        toast.error(data.error || 'Erro ao criar conta.');
      }
    } catch {
      toast.error('Erro de conexao. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = 'h-11 border-2 border-gray-200 focus:border-slate-600 transition-colors';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-0">

        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-slate-100 overflow-hidden">
            <img src="/logos/logo-main.png" alt="Plantao Facil" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
            <p className="text-sm text-gray-500 mt-1">Plantao Facil — Gestao de plantoes medicos</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Secao 1: Dados de Acesso ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <UserPlus className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Dados de acesso
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Dr. Joao Silva"
                  value={form.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  className={inputCls}
                  required
                />
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
                  className={inputCls}
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
                    className={inputCls}
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
                    className={inputCls}
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Secao 2: Contato e Notificacoes ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Bell className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Contato e notificacoes
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Celular para SMS</label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => set('telefone', e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 pt-0.5">
                  Voce recebera alertas de novos plantoes por SMS neste numero.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email para alertas</label>
                <Input
                  type="email"
                  placeholder={form.email || 'mesmo do login'}
                  value={form.emailNotificacao}
                  onChange={(e) => set('emailNotificacao', e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 pt-0.5">
                  Onde receber alertas de plantoes. Pode ser diferente do email de login.
                  {!form.emailNotificacao && form.email && (
                    <span className="text-slate-500">
                      {' '}Sera usado: <strong>{form.email}</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* ── Secao 3: Dados Profissionais (opcional) ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Stethoscope className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Dados profissionais{' '}
                  <span className="text-xs font-normal text-gray-400 normal-case">(opcional)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CRM</label>
                  <Input
                    type="text"
                    placeholder="123456-SP"
                    value={form.crm}
                    onChange={(e) => set('crm', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Especialidade</label>
                  <select
                    value={form.especialidade}
                    onChange={(e) => set('especialidade', e.target.value)}
                    className="w-full h-11 px-3 rounded-md border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-slate-600 transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {ESPECIALIDADES.map((esp) => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Ja tem conta? </span>
              <Link href="/login" className="text-slate-700 font-semibold hover:underline">
                Fazer login
              </Link>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                Seus dados estao protegidos e nunca serao compartilhados
              </p>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
