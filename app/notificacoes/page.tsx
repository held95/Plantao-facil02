'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, MapPin, DollarSign } from 'lucide-react';

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState({
    novosPlantoes: true,
    meusPlantoes: true,
    lembrete24h: true,
    lembrete1h: false,
    alteracoes: true,
    email: true,
    app: true,
  });

  const [filtros, setFiltros] = useState({
    valorMin: '',
    valorMax: '',
    locais: '',
  });

  const handleSave = () => {
    console.log('Salvando preferências:', { notificacoes, filtros });
    alert('Preferências salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configurações de Notificação
            </h1>
            <p className="text-gray-600">
              Configure como e quando você deseja receber notificações sobre plantões
            </p>
          </div>

          {/* General Notifications */}
          <Card className="mb-6 bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notificações Gerais
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ative ou desative notificações de novos plantões
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                enabled={notificacoes.novosPlantoes}
                onChange={(enabled) => setNotificacoes(prev => ({ ...prev, novosPlantoes: enabled }))}
                label="Notificar sobre novos plantões"
                description="Receba alertas quando plantões que correspondem às suas preferências forem criados"
              />

              <Toggle
                enabled={notificacoes.meusPlantoes}
                onChange={(enabled) => setNotificacoes(prev => ({ ...prev, meusPlantoes: enabled }))}
                label="Notificar sobre meus plantões"
                description="Receba alertas sobre inscrições nos plantões que você criou"
              />

              <Toggle
                enabled={notificacoes.lembrete24h}
                onChange={(enabled) => setNotificacoes(prev => ({ ...prev, lembrete24h: enabled }))}
                label="Lembrete 24h antes do plantão"
                description="Receba um lembrete um dia antes do seu plantão começar"
              />

              <Toggle
                enabled={notificacoes.lembrete1h}
                onChange={(enabled) => setNotificacoes(prev => ({ ...prev, lembrete1h: enabled }))}
                label="Lembrete 1h antes do plantão"
                description="Receba um lembrete uma hora antes do seu plantão começar"
              />

              <Toggle
                enabled={notificacoes.alteracoes}
                onChange={(enabled) => setNotificacoes(prev => ({ ...prev, alteracoes: enabled }))}
                label="Notificar sobre alterações"
                description="Receba alertas quando houver mudanças em plantões nos quais você está inscrito"
              />
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Canais de Notificação</CardTitle>
              <p className="text-sm text-gray-600">
                Escolha como deseja receber as notificações
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <Toggle
                  enabled={notificacoes.email}
                  onChange={(enabled) => setNotificacoes(prev => ({ ...prev, email: enabled }))}
                  label="Email"
                  description="Receber notificações por email em helder.datacience@gmail.com"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                </div>
                <Toggle
                  enabled={notificacoes.app}
                  onChange={(enabled) => setNotificacoes(prev => ({ ...prev, app: enabled }))}
                  label="Aplicativo"
                  description="Receber notificações dentro da aplicação"
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interest Filters */}
          <Card className="mt-6 bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Filtros de Interesse</CardTitle>
              <p className="text-sm text-gray-600">
                Receba notificações apenas de plantões que correspondem aos seus critérios
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Faixa de Valor (R$)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filtros.valorMin}
                    onChange={(e) => setFiltros(prev => ({ ...prev, valorMin: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filtros.valorMax}
                    onChange={(e) => setFiltros(prev => ({ ...prev, valorMax: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Locais de Interesse
                </label>
                <Input
                  placeholder="Ex: Hospital Central, Zona Sul"
                  value={filtros.locais}
                  onChange={(e) => setFiltros(prev => ({ ...prev, locais: e.target.value }))}
                />
                <p className="mt-2 text-xs text-gray-600">
                  Adicione palavras-chave de locais que você tem interesse
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} size="lg">
              Salvar Preferências
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
