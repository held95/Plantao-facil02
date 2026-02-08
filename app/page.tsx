import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Hospital, Users, Clock, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {APP_NAME}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Encontre Plantões Médicos
            </p>
            <p className="text-base text-gray-500">
              Conecte-se com oportunidades em hospitais de todo o Brasil
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <Hospital className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-sm text-gray-500 mt-1">Plantões Disponíveis</div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">R$ 800 - R$ 2.000</div>
                <div className="text-sm text-gray-500 mt-1">Faixa de Valores</div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <MapPin className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-500 mt-1">Cidades Atendidas</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Card */}
          <Card className="mb-16 border-gray-200 shadow-sm">
            <CardContent className="pt-10 pb-10 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Encontre Seu Próximo Plantão
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Navegue por plantões disponíveis em diversas especialidades e hospitais.
                Inscreva-se de forma rápida e simples.
              </p>

              <Link href="/plantoes">
                <Button size="lg" className="px-8">
                  Ver Plantões Disponíveis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <Hospital className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-base text-gray-900 mb-2">
                  Diversos Hospitais
                </h3>
                <p className="text-gray-600 text-sm">
                  Plantões em hospitais municipais, regionais e privados de São Paulo e região.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-base text-gray-900 mb-2">
                  Múltiplas Especialidades
                </h3>
                <p className="text-gray-600 text-sm">
                  Clínica Geral, Cirurgia, Pediatria, Ortopedia, Cardiologia, Pronto Socorro e mais.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-base text-gray-900 mb-2">
                  Horários Flexíveis
                </h3>
                <p className="text-gray-600 text-sm">
                  Plantões diurnos, noturnos e de meio período. Escolha o que melhor se encaixa na sua agenda.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <DollarSign className="h-8 w-8 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-base text-gray-900 mb-2">
                  Valores Competitivos
                </h3>
                <p className="text-gray-600 text-sm">
                  Remuneração justa de acordo com especialidade e duração do plantão.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Como Funciona</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-base text-gray-900 mb-2">Navegue</h3>
                <p className="text-sm text-gray-600">
                  Veja todos os plantões disponíveis com detalhes completos
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-base text-gray-900 mb-2">Inscreva-se</h3>
                <p className="text-sm text-gray-600">
                  Candidate-se ao plantão que se encaixa na sua especialidade
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-base text-gray-900 mb-2">Confirme</h3>
                <p className="text-sm text-gray-600">
                  Receba confirmação e detalhes do plantão por email
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 text-xs border-t border-gray-200 pt-8">
            <p>Versão 1.0.0 • Plataforma de Gestão de Plantões Médicos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
