'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CoverageChart } from '@/components/dashboard/CoverageChart';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import {
  Hospital,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-600">Visao geral da plataforma</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Carregando dados...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-700 text-sm">
              Erro ao carregar dados do dashboard. Verifique suas permissoes.
            </p>
          </div>
        ) : data ? (
          <>
            {/* Plantoes stats */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Plantoes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Total de Plantoes"
                value={data.plantoes.total}
                icon={Calendar}
                color="blue"
              />
              <StatsCard
                title="Disponiveis"
                value={data.plantoes.disponiveis}
                icon={Clock}
                color="yellow"
              />
              <StatsCard
                title="Preenchidos"
                value={data.plantoes.preenchidos}
                icon={CheckCircle2}
                color="green"
              />
              <StatsCard
                title="Cancelados"
                value={data.plantoes.cancelados}
                icon={XCircle}
                color="red"
              />
            </div>

            {/* Usuarios stats */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Usuarios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatsCard
                title="Total de Usuarios"
                value={data.usuarios.total}
                icon={Users}
                color="purple"
              />
              <StatsCard
                title="Medicos"
                value={data.usuarios.medicos}
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Coordenadores"
                value={data.usuarios.coordenadores}
                icon={Users}
                color="green"
              />
            </div>

            {/* Documentos */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Documentos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatsCard
                title="Total de Documentos"
                value={data.documentos.total}
                icon={FileText}
                color="gray"
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Hospital className="h-4 w-4" />
                    Cobertura por Hospital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CoverageChart data={data.coberturaHospitais} />
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Plantoes por Especialidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(data.byEspecialidade)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 8)
                      .map(([esp, count]) => (
                        <div key={esp} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate">{esp}</span>
                          <span className="text-sm font-semibold text-gray-900 ml-2">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
