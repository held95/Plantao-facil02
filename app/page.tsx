'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Clock, TrendingUp, ArrowRight, Plus } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, Helder Correa
          </h1>
          <p className="text-gray-600">
            Aqui esta um resumo das suas atividades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Plantoes Disponiveis</div>
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">8</div>
              <p className="text-xs text-gray-500 mt-1">Plantoes abertos para inscricao</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Minhas Inscricoes</div>
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-500 mt-1">Inscricoes ativas</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Horas Trabalhadas</div>
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">72</div>
              <p className="text-xs text-gray-500 mt-1">Total este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Este Mes</div>
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">R$ 9.600</div>
              <p className="text-xs text-gray-500 mt-1">Valor total estimado</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Ver Plantoes Disponiveis */}
          <Link href="/plantoes">
            <Card className="bg-gradient-to-br from-slate-600 to-slate-700 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Ver Plantoes Disponiveis
                    </h3>
                    <p className="text-slate-100 text-sm mb-4">
                      Navegue por plantoes abertos e se inscreva
                    </p>
                    <Button
                      variant="secondary"
                      className="bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Ver Plantoes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <Calendar className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Criar Novo Plantao */}
          <Link href="/criar">
            <Card className="bg-gradient-to-br from-slate-600 to-slate-700 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Criar Novo Plantao
                    </h3>
                    <p className="text-slate-100 text-sm mb-4">
                      Publique um novo plantao para sua equipe
                    </p>
                    <Button
                      variant="secondary"
                      className="bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Criar Plantao
                      <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <Plus className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Links */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rapido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/inscricoes">
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                  <FileText className="mr-2 h-4 w-4" />
                  Minhas Inscricoes
                </Button>
              </Link>
              <Link href="/notificacoes">
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                  <Calendar className="mr-2 h-4 w-4" />
                  Notificacoes
                </Button>
              </Link>
              <Link href="/coordenadores">
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                  <Calendar className="mr-2 h-4 w-4" />
                  Coordenadores
                </Button>
              </Link>
              <Link href="/plantoes">
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                  <Calendar className="mr-2 h-4 w-4" />
                  Todos os Plantoes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
