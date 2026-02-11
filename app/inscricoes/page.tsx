'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Hospital, DollarSign, X } from 'lucide-react';

// Mock data para inscricoes
const mockInscricoes = [
  {
    id: '1',
    plantao: {
      id: '1',
      hospital: 'Hospital Municipal de Barueri',
      especialidade: 'Clinica Geral',
      data: '2026-02-15',
      horarioInicio: '07:00',
      horarioFim: '19:00',
      valor: 1200,
      cidade: 'Barueri',
      estado: 'SP',
    },
    status: 'confirmado',
    dataInscricao: '2026-02-09',
  },
  {
    id: '2',
    plantao: {
      id: '2',
      hospital: 'Hospital Regional de Sorocaba',
      especialidade: 'Cirurgia Geral',
      data: '2026-02-16',
      horarioInicio: '19:00',
      horarioFim: '07:00',
      valor: 1800,
      cidade: 'Sorocaba',
      estado: 'SP',
    },
    status: 'pendente',
    dataInscricao: '2026-02-09',
  },
  {
    id: '3',
    plantao: {
      id: '5',
      hospital: 'Hospital Municipal de Barueri',
      especialidade: 'Pronto Socorro',
      data: '2026-02-19',
      horarioInicio: '19:00',
      horarioFim: '07:00',
      valor: 1500,
      cidade: 'Barueri',
      estado: 'SP',
    },
    status: 'confirmado',
    dataInscricao: '2026-02-08',
  },
];

export default function InscricoesPage() {
  const [activeTab, setActiveTab] = useState('todas');

  const handleCancelarInscricao = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta inscricao?')) {
      // Aqui voce adicionaria a logica para cancelar a inscricao
      console.log('Cancelando inscricao:', id);
      alert('Inscricao cancelada com sucesso!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Filter inscricoes based on active tab
  const filteredInscricoes = mockInscricoes.filter((inscricao) => {
    if (activeTab === 'todas') return true;
    if (activeTab === 'confirmadas') return inscricao.status === 'confirmado';
    if (activeTab === 'pendentes') return inscricao.status === 'pendente';
    if (activeTab === 'canceladas') return inscricao.status === 'cancelado';
    return true;
  });

  const tabs = [
    { value: 'todas', label: 'Todas' },
    { value: 'confirmadas', label: 'Confirmadas' },
    { value: 'pendentes', label: 'Pendentes' },
    { value: 'canceladas', label: 'Canceladas' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minhas Inscricoes
          </h1>
          <p className="text-gray-600">
            Acompanhe suas inscricoes em plantoes
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total de Inscricoes</div>
              <div className="text-3xl font-bold text-gray-900">{mockInscricoes.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Confirmadas</div>
              <div className="text-3xl font-bold text-green-600">
                {mockInscricoes.filter(i => i.status === 'confirmado').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Pendentes</div>
              <div className="text-3xl font-bold text-yellow-600">
                {mockInscricoes.filter(i => i.status === 'pendente').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inscricoes List */}
        <div className="space-y-4">
          {filteredInscricoes.map((inscricao) => (
            <Card key={inscricao.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Hospital className="h-5 w-5 text-gray-500" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {inscricao.plantao.hospital}
                      </h3>
                      <Badge
                        className={
                          inscricao.status === 'confirmado'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                        }
                      >
                        {inscricao.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {inscricao.plantao.especialidade}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(inscricao.plantao.data)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {inscricao.plantao.horarioInicio} - {inscricao.plantao.horarioFim}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {inscricao.plantao.cidade}, {inscricao.plantao.estado}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>R$ {inscricao.plantao.valor.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      Inscrito em: {formatDate(inscricao.dataInscricao)}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleCancelarInscricao(inscricao.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar Inscricao
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInscricoes.length === 0 && (
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma inscricao encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Voce ainda nao se inscreveu em nenhum plantao.
              </p>
              <Button>
                Ver Plantoes Disponiveis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
