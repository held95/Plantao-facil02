'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusLegend } from '@/components/calendario/StatusLegend';
import { getPlantoesDisponiveis } from '@/lib/data/mockPlantoes';
import { formatDate } from '@/lib/utils/date';
import { getStatusDisplay, getStatusLabel } from '@/lib/utils/status';
import { filterPlantoesByStatus, filterPlantoesByLocal, searchPlantoes } from '@/lib/utils/filters';
import { Calendar, Clock, MapPin, User, Phone, Search } from 'lucide-react';

export default function PlantoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [localFilter, setLocalFilter] = useState('');

  // Get plantoes and add status display
  const allPlantoes = getPlantoesDisponiveis().map((plantao) => ({
    ...plantao,
    statusDisplay: getStatusDisplay(plantao),
  }));

  // Apply filters
  let filteredPlantoes = allPlantoes;
  filteredPlantoes = searchPlantoes(filteredPlantoes, searchTerm);
  filteredPlantoes = filterPlantoesByStatus(filteredPlantoes, statusFilter);
  filteredPlantoes = filterPlantoesByLocal(filteredPlantoes, localFilter);

  const statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Aberto', value: 'aberto' },
    { label: 'Futuro', value: 'futuro' },
    { label: 'Fechado', value: 'fechado' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plantões Disponíveis
          </h1>
          <p className="text-gray-600">
            Escolha e se inscreva nos plantões disponíveis
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Status"
              />
              <Input
                placeholder="Filtrar por local..."
                value={localFilter}
                onChange={(e) => setLocalFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Legend */}
        <StatusLegend />

        {/* Section Title */}
        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Plantões Abertos</h2>
        </div>

        {/* Plantões Grid */}
        <div className="space-y-4">
          {filteredPlantoes.map((plantao) => (
            <Card key={plantao.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {plantao.hospital}
                      </h3>
                      <StatusBadge status={plantao.statusDisplay}>
                        {getStatusLabel(plantao.statusDisplay)}
                      </StatusBadge>
                    </div>

                    {plantao.descricao && (
                      <p className="text-gray-600 text-sm mb-4">
                        {plantao.descricao}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(plantao.data)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{plantao.horarioInicio} - {plantao.horarioFim}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{plantao.cidade}, {plantao.estado}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>Dr. Coordenador</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>(11) 99999-9999</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>0 / {plantao.vagasTotal} inscritos</span>
                      </div>
                    </div>

                    <Link href={`/plantoes/${plantao.id}`}>
                      <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                        Me inscrever para o plantão
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlantoes.length === 0 && (
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum plantão disponível no momento
              </h3>
              <p className="text-gray-600">
                Novos plantões serão publicados em breve.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
