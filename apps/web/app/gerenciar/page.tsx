import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, UserCheck } from 'lucide-react';

export default function GerenciarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar</h1>
          <p className="mt-1 text-sm text-gray-600">
            Acesse os modulos administrativos de inscricoes e aprovacao de contas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <ClipboardList className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-gray-900">Inscricoes</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Visualize e administre inscricoes dos profissionais.
              </p>
              <Button type="button" variant="outline" disabled>
                Em desenvolvimento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <UserCheck className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-gray-900">Aprovacao de contas</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Aprove ou rejeite solicitacoes de cadastro pendentes.
              </p>
              <Button asChild>
                <Link href="/gerenciar/aprovacoes">Abrir aprovacoes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

