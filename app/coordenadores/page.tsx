'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Trash2 } from 'lucide-react';
import { mockCoordenadores } from '@/lib/data/mockCoordenadores';

export default function CoordenadoresPage() {
  const [newEmail, setNewEmail] = useState('');
  const [coordenadores, setCoordenadores] = useState(mockCoordenadores);

  const handleAddCoordenador = () => {
    if (!newEmail.trim()) return;

    // TODO: Implement API call to add coordinator
    console.log('Adding coordinator:', newEmail);
    setNewEmail('');
    alert('Funcionalidade em desenvolvimento. O usuário precisa ter feito login no sistema pelo menos uma vez.');
  };

  const handleRemoveCoordenador = (id: string) => {
    // TODO: Implement API call to remove coordinator
    console.log('Removing coordinator:', id);
    setCoordenadores(coordenadores.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Coordenadores
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Adicione ou remova permissões de coordenador
          </p>
        </div>

        {/* Add Coordinator Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adicionar Coordenador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Digite o email do usuário"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddCoordenador();
                }}
                className="flex-1"
              />
              <Button onClick={handleAddCoordenador}>Adicionar</Button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              O usuário precisa ter feito login no sistema pelo menos uma vez
            </p>
          </CardContent>
        </Card>

        {/* Coordinators List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Coordenadores ({coordenadores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coordenadores.map((coordenador) => (
                <div
                  key={coordenador.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <User className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {coordenador.nome}
                        </span>
                        <Badge variant="secondary">
                          {coordenador.especialidade}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {coordenador.email}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveCoordenador(coordenador.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-2">Remover</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
