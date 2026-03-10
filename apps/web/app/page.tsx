'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Logo } from '@/components/common/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Clock, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { usePlantoes } from '@/hooks/usePlantoes';

function calcHoras(inicio: string, fim: string): number {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fim.split(':').map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

export default function HomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Usuário';
  const { data: apiData } = usePlantoes();
  const plantoes = apiData ?? [];

  const disponivel = plantoes.filter(
    (p) => p.status === 'disponivel' && p.vagasDisponiveis > 0
  );

  const qtdDisponiveis = disponivel.length;

  const totalInscricoes = plantoes.reduce(
    (acc, p) => acc + (p.vagasTotal - p.vagasDisponiveis),
    0
  );

  const totalHoras = Math.round(
    disponivel.reduce(
      (acc, p) => acc + calcHoras(p.horarioInicio, p.horarioFim),
      0
    )
  );

  const mediaValor =
    disponivel.length > 0
      ? disponivel.reduce((acc, p) => acc + p.valor, 0) / disponivel.length
      : 0;
  const mediaValorFormatada = `R$ ${mediaValor.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-10 flex items-center gap-6">
          <Logo variant="main" size={64} linkToHome={false} />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              👋 Bem-vindo, {userName}
            </h1>
            <p className="text-lg text-gray-600">
              Aqui está um resumo das suas atividades e oportunidades
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-blue-100">Plantões Disponíveis</div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{qtdDisponiveis}</div>
              <p className="text-sm text-blue-100">Plantões abertos para inscrição</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-green-100">Vagas Preenchidas</div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{totalInscricoes}</div>
              <p className="text-sm text-green-100">Total de inscrições realizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-purple-100">Horas Disponíveis</div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{totalHoras}h</div>
              <p className="text-sm text-purple-100">Total de horas em plantões abertos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-amber-100">Média por Plantão</div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-1">{mediaValorFormatada}</div>
              <p className="text-sm text-amber-100">Remuneração média dos plantões</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Ver Plantoes Disponiveis */}
          <Link href="/plantoes">
            <Card className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-10 pb-10 relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-3">
                      Ver Plantões Disponíveis
                    </h3>
                    <p className="text-slate-200 text-base mb-6">
                      Navegue por plantões abertos e se inscreva agora
                    </p>
                    <Button
                      variant="secondary"
                      className="bg-white text-slate-700 hover:bg-slate-50 shadow-md group-hover:shadow-lg transition-all"
                    >
                      Ver Plantões
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <div className="hidden lg:block">
                    <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all">
                      <Calendar className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Criar Novo Plantao */}
          <Link href="/criar">
            <Card className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-10 pb-10 relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-3">
                      Criar Novo Plantão
                    </h3>
                    <p className="text-slate-200 text-base mb-6">
                      Publique um novo plantão para sua equipe
                    </p>
                    <Button
                      variant="secondary"
                      className="bg-white text-slate-700 hover:bg-slate-50 shadow-md group-hover:shadow-lg transition-all"
                    >
                      Criar Plantão
                      <Plus className="ml-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                    </Button>
                  </div>
                  <div className="hidden lg:block">
                    <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all">
                      <Plus className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Links */}
        <Card className="bg-white border-gray-200 shadow-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Acesso Rápido</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/inscricoes">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all group">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Minhas Inscrições</span>
                </Button>
              </Link>
              <Link href="/calendario">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all group">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Calendário</span>
                </Button>
              </Link>
              <Link href="/notificacoes">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-200 hover:bg-amber-50 hover:border-amber-300 transition-all group">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium">Notificações</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
