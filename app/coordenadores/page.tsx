'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Trash2 } from 'lucide-react';
import { mockCoordenadores } from '@/lib/data/mockCoordenadores';

export default function CoordenadoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [coordenadores, setCoordenadores] = useState(mockCoordenadores);

  // Check authorization - only coordinators and admins can access
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/login?callbackUrl=/coordenadores');
      return;
    }

    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'coordenador' && userRole !== 'admin') {
        // Redirect to dashboard if not coordinator/admin
        router.push('/?error=access_denied&message=Voc%C3%AA%20n%C3%A3o%20tem%20permiss%C3%A3o%20para%20acessar%20esta%20p%C3%A1gina');
      }
    }
  }, [status, session, router]);

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

  // Show loading while checking authorization
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render page if not authorized (will redirect via useEffect)
  if (session?.user?.role !== 'coordenador' && session?.user?.role !== 'admin') {
    return null;
  }

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
