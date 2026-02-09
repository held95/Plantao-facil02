'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ActivityEntry } from '@/components/logs/ActivityEntry';
import { mockActivityLogs, mockActivityStats } from '@/lib/data/mockLogs';

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');

  // Filter logs
  const filteredLogs = mockActivityLogs.filter((log) => {
    // Filter by search term (user or email)
    const matchesSearch =
      searchTerm === '' ||
      log.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usuarioEmail.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by type
    const matchesType =
      filterType === 'todos' || log.tipo === filterType;

    return matchesSearch && matchesType;
  });

  const typeOptions = [
    { label: 'Todos os Tipos', value: 'todos' },
    { label: 'Login', value: 'usuario_login' },
    { label: 'Logout', value: 'usuario_logout' },
    { label: 'Plantão Criado', value: 'plantao_criado' },
    { label: 'Plantão Atualizado', value: 'plantao_atualizado' },
    { label: 'Inscrição Realizada', value: 'inscricao_realizada' },
    { label: 'Inscrição Aprovada', value: 'inscricao_aprovada' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Logs de Atividade
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Acompanhe todas as ações realizadas no sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {mockActivityStats.totalAtividades}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Total de Atividades
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {mockActivityStats.atividadesHoje}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Atividades Hoje
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {mockActivityStats.tiposDeAcao}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Tipos de Ação
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                placeholder="Buscar por usuário, email ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={filterType}
                onChange={setFilterType}
                options={typeOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <ActivityEntry key={log.id} activity={log} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">
                  Nenhuma atividade encontrada com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
