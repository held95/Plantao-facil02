'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, Smartphone } from 'lucide-react';

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState({
    novosPlantoes: true,
    meusPlantoes: true,
    email: true,
    app: true,
  });

  const handleToggle = (key: string) => {
    setNotificacoes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

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
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">Notificar sobre novos plantões</div>
                  <div className="text-sm text-gray-600">
                    Receba alertas quando plantões que correspondem às suas preferências forem criados
                  </div>
                </div>
                <Toggle enabled={notificacoes.novosPlantoes} onToggle={() => handleToggle('novosPlantoes')} />
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">Notificar sobre meus plantões</div>
                  <div className="text-sm text-gray-600">
                    Receba alertas sobre inscrições nos plantões que você criou
                  </div>
                </div>
                <Toggle enabled={notificacoes.meusPlantoes} onToggle={() => handleToggle('meusPlantoes')} />
              </div>
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
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Email</div>
                    <div className="text-sm text-gray-600">
                      Receber notificações por email em helder.datacience@gmail.com
                    </div>
                  </div>
                </div>
                <Toggle enabled={notificacoes.email} onToggle={() => handleToggle('email')} />
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Aplicativo</div>
                    <div className="text-sm text-gray-600">
                      Receber notificações dentro da aplicação
                    </div>
                  </div>
                </div>
                <Toggle enabled={notificacoes.app} onToggle={() => handleToggle('app')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
