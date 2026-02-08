import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Hospital, Users, Clock, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {APP_NAME}
            </h1>
            <p className="text-2xl text-gray-700 mb-2">
              Encontre Plantões Médicos
            </p>
            <p className="text-lg text-gray-600">
              Conecte-se com oportunidades em hospitais de todo o Brasil
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">🏥</div>
                <div className="text-3xl font-bold text-gray-900">8</div>
                <div className="text-sm text-gray-600 mt-1">Plantões Disponíveis</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">💰</div>
                <div className="text-3xl font-bold text-gray-900">R$ 800 - R$ 2.000</div>
                <div className="text-sm text-gray-600 mt-1">Faixa de Valores</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">📍</div>
                <div className="text-3xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600 mt-1">Cidades Atendidas</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Card */}
          <Card className="mb-12 bg-white">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Encontre Seu Próximo Plantão
              </h2>
              <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
                Navegue por plantões disponíveis em diversas especialidades e hospitais.
                Inscreva-se de forma rápida e simples.
              </p>

              <Link href="/plantoes">
                <Button size="lg" className="text-lg px-8 py-6">
                  Ver Plantões Disponíveis →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <Hospital className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Diversos Hospitais
                </h3>
                <p className="text-gray-600 text-sm">
                  Plantões em hospitais municipais, regionais e privados de São Paulo e região.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Múltiplas Especialidades
                </h3>
                <p className="text-gray-600 text-sm">
                  Clínica Geral, Cirurgia, Pediatria, Ortopedia, Cardiologia, Pronto Socorro e mais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Horários Flexíveis
                </h3>
                <p className="text-gray-600 text-sm">
                  Plantões diurnos, noturnos e de meio período. Escolha o que melhor se encaixa na sua agenda.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <DollarSign className="h-8 w-8 text-yellow-600 mb-3" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Valores Competitivos
                </h3>
                <p className="text-gray-600 text-sm">
                  Remuneração justa de acordo com especialidade e duração do plantão.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-center mb-8">Como Funciona</h2>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Navegue</h3>
                  <p className="text-sm text-blue-100">
                    Veja todos os plantões disponíveis com detalhes completos
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Inscreva-se</h3>
                  <p className="text-sm text-blue-100">
                    Candidate-se ao plantão que se encaixa na sua especialidade
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Confirme</h3>
                  <p className="text-sm text-blue-100">
                    Receba confirmação e detalhes do plantão por email
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>Versão 1.0.0 • Desenvolvido com Next.js, TypeScript e TailwindCSS</p>
            <p className="mt-1">Plataforma de Gestão de Plantões Médicos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
