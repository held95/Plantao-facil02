'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlantaoMap from '@/components/plantoes/PlantaoMap';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusLegend } from '@/components/calendario/StatusLegend';
import { formatDate } from '@plantao/shared';
import { getStatusDisplay, getStatusLabel } from '@plantao/shared';
import { filterPlantoesByStatus, filterPlantoesByLocal, searchPlantoes } from '@plantao/shared';
import { Calendar, Clock, MapPin, User, Phone, Search, X } from 'lucide-react';
import { usePlantoes } from '@/hooks/usePlantoes';
import type { Plantao } from '@plantao/shared';

export default function PlantoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [localFilter, setLocalFilter] = useState('');
  const [especialidadeFilter, setEspecialidadeFilter] = useState('');

  const { data: apiData } = usePlantoes();
  const allApiPlantoes = apiData ?? [];

  // Apenas disponíveis com vagas
  const disponiveis: Plantao[] = allApiPlantoes.filter(
    (p) => p.status === 'disponivel' && p.vagasDisponiveis > 0
  );

  // Especialidades únicas para o dropdown
  const especialidades = Array.from(
    new Set(allApiPlantoes.map((p) => p.especialidade).filter(Boolean))
  ).sort();

  const plantoesWithStatus = disponiveis.map((plantao) => ({
    ...plantao,
    statusDisplay: getStatusDisplay(plantao),
  }));

  // Apply filters
  let filteredPlantoes = plantoesWithStatus;
  filteredPlantoes = searchPlantoes(filteredPlantoes, searchTerm);
  filteredPlantoes = filterPlantoesByStatus(filteredPlantoes, statusFilter);
  filteredPlantoes = filterPlantoesByLocal(filteredPlantoes, localFilter);
  if (especialidadeFilter) {
    filteredPlantoes = filteredPlantoes.filter(
      (p) => p.especialidade === especialidadeFilter
    );
  }

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'todos' ||
    localFilter !== '' ||
    especialidadeFilter !== '';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setLocalFilter('');
    setEspecialidadeFilter('');
  };

  const statusOptions = [
    { label: 'Todos os status', value: 'todos' },
    { label: 'Aberto', value: 'aberto' },
    { label: 'Futuro', value: 'futuro' },
    { label: 'Fechado', value: 'fechado' },
  ];

  const especialidadeOptions = [
    { label: 'Todas as especialidades', value: '' },
    ...especialidades.map((e) => ({ label: e, value: e })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plantões Disponíveis
          </h1>
          <p className="text-gray-600">
            Escolha e se inscreva nos plantões disponíveis
          </p>
        </div>

        {/* Filter Card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-5 pb-5">
            {/* Line 1: search + status */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por hospital ou descrição..."
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
            </div>

            {/* Line 2: local + especialidade + clear */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Input
                placeholder="Filtrar por cidade/estado..."
                value={localFilter}
                onChange={(e) => setLocalFilter(e.target.value)}
              />
              <Select
                value={especialidadeFilter}
                onChange={setEspecialidadeFilter}
                options={especialidadeOptions}
                placeholder="Especialidade"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <StatusLegend />

        <div className="mb-6">
          <PlantaoMap plantoes={filteredPlantoes} />
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Plantões Abertos</h2>
          <span className="text-sm text-gray-500 ml-2">
            {filteredPlantoes.length}{' '}
            {filteredPlantoes.length === 1 ? 'plantão encontrado' : 'plantões encontrados'}
          </span>
        </div>

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
                      <p className="text-gray-600 text-sm mb-4">{plantao.descricao}</p>
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
                        <span>{plantao.especialidade}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{plantao.vagasDisponiveis} / {plantao.vagasTotal} vagas</span>
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
                {hasActiveFilters
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Novos plantões serão publicados em breve.'}
              </p>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
