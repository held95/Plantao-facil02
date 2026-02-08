'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPlantoesDisponiveis } from '@/lib/data/mockPlantoes';
import { formatDate } from '@/lib/utils/date';
import { Calendar, Clock, MapPin, DollarSign, Users, ChevronRight } from 'lucide-react';

export default function PlantoesPage() {
  const plantoes = getPlantoesDisponiveis();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Plantões Disponíveis
          </h1>
          <p className="text-slate-600">
            {plantoes.length} plantões disponíveis para inscrição
          </p>
        </div>

        {/* Plantões Grid */}
        <div className="grid gap-4">
          {plantoes.map((plantao) => (
            <Link key={plantao.id} href={`/plantoes/${plantao.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default">{plantao.especialidade}</Badge>
                        <Badge variant="outline">
                          {plantao.vagasDisponiveis} {plantao.vagasDisponiveis === 1 ? 'vaga' : 'vagas'}
                        </Badge>
                      </div>

                      <CardTitle className="text-xl mb-3">
                        {plantao.hospital}
                      </CardTitle>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(plantao.data)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{plantao.horarioInicio} às {plantao.horarioFim}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span>{plantao.cidade} - {plantao.estado}</span>
                        </div>

                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>R$ {plantao.valor.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>

                      {plantao.descricao && (
                        <p className="text-slate-600 text-sm mt-3">
                          {plantao.descricao}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400 ml-4" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {plantoes.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhum plantão disponível no momento
              </h3>
              <p className="text-slate-600">
                Novos plantões serão publicados em breve.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
