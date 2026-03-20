'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { DocumentList } from '@/components/documentos/DocumentList';
import { SwapRequestModal } from '@/components/plantoes/SwapRequestModal';
import { getPlantaoPorId } from '@/lib/data/mockPlantoes';
import { formatDate, formatDateFull } from '@plantao/shared';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Hospital,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlantaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const plantao = getPlantaoPorId(id);
  const [inscrito, setInscrito] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get('tab') === 'documentos' ? 'documentos' : 'informacoes';
  const [activeTab, setActiveTab] = useState(initialTab);

  const canUpload =
    session?.user?.role === 'coordenador' || session?.user?.role === 'admin';
  const isMedico = session?.user?.role === 'medico';

  const handleInscrever = () => {
    setInscrito(true);
    toast.success('Inscrição realizada com sucesso!', {
      description: 'Você receberá um email de confirmação em breve.',
    });
  };

  if (!plantao) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-red-800">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Plantão não encontrado</p>
                  <p className="text-sm text-red-600">O plantão solicitado não existe ou foi removido.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const calcularDuracao = () => {
    const [horaInicio] = plantao.horarioInicio.split(':').map(Number);
    const [horaFim] = plantao.horarioFim.split(':').map(Number);
    const duracao = horaFim > horaInicio ? horaFim - horaInicio : 24 - horaInicio + horaFim;
    return duracao;
  };

  const informacoesContent = (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default" className="bg-blue-600">
              {plantao.especialidade}
            </Badge>
            <Badge variant={plantao.vagasDisponiveis > 0 ? 'success' : 'destructive'} className="border-gray-300">
              {plantao.vagasDisponiveis > 0
                ? `${plantao.vagasDisponiveis} ${plantao.vagasDisponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'}`
                : 'Sem vagas'}
            </Badge>
          </div>

          <CardTitle className="text-3xl mb-2 text-gray-900">{plantao.hospital}</CardTitle>
          <CardDescription className="text-base text-gray-600">
            {plantao.cidade} - {plantao.estado}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {plantao.descricao && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-600">{plantao.descricao}</p>
            </div>
          )}

          {plantao.requisitos && plantao.requisitos.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requisitos</h3>
              <ul className="space-y-2">
                {plantao.requisitos.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Informações do Plantão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem icon={<Calendar />} label="Data" value={formatDateFull(plantao.data)} />
            <InfoItem
              icon={<Clock />}
              label="Horário"
              value={`${plantao.horarioInicio} às ${plantao.horarioFim} (${calcularDuracao()}h)`}
            />
            <InfoItem
              icon={<MapPin />}
              label="Localização"
              value={`${plantao.cidade} - ${plantao.estado}`}
            />
            <InfoItem icon={<Hospital />} label="Hospital" value={plantao.hospital} />
            <InfoItem icon={<Stethoscope />} label="Especialidade" value={plantao.especialidade} />
            <InfoItem
              icon={<DollarSign />}
              label="Valor"
              value={`R$ ${plantao.valor.toLocaleString('pt-BR')}`}
              valueClassName="text-green-600 font-semibold"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/plantoes">
            <Button variant="outline" size="sm" className="border-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Plantões
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              tabs={[
                { value: 'informacoes', label: 'Informações', content: informacoesContent },
                {
                  value: 'documentos',
                  label: 'Documentos',
                  content: (
                    <DocumentList plantaoId={id} canUpload={canUpload} />
                  ),
                },
              ]}
            />
          </div>

          {/* Sidebar - Inscrição */}
          <div>
            <Card className="sticky top-4 border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Inscrever-se no Plantão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    R$ {plantao.valor.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Pagamento após conclusão do plantão
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-medium text-gray-900">{calcularDuracao()} horas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vagas disponíveis:</span>
                    <span className="font-medium text-gray-900">
                      {plantao.vagasDisponiveis} de {plantao.vagasTotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium text-gray-900">{formatDate(plantao.data)}</span>
                  </div>
                </div>

                {!inscrito ? (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    onClick={handleInscrever}
                    disabled={plantao.vagasDisponiveis === 0}
                  >
                    {plantao.vagasDisponiveis > 0 ? 'Inscrever-se Agora' : 'Sem Vagas Disponíveis'}
                  </Button>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">Inscrição Realizada!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Você receberá um email de confirmação
                    </p>
                  </div>
                )}

                {isMedico && inscrito && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setShowSwapModal(true)}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Propor Troca
                  </Button>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Ao se inscrever, você concorda com os termos e condições do plantão
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>

    {showSwapModal && (
      <SwapRequestModal
        plantaoOrigemId={id}
        onClose={() => setShowSwapModal(false)}
      />
    )}
  </>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-medium ${valueClassName || 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}
