'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plantao } from '@/types/plantao';
import { Calendar, Clock, MapPin, DollarSign, Users, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import axios from 'axios';

interface PlantaoDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantoes: Plantao[];
  selectedDate: Date;
}

export function PlantaoDetailModal({
  open,
  onOpenChange,
  plantoes,
  selectedDate,
}: PlantaoDetailModalProps) {
  const { data: session } = useSession();
  const isMedico = session?.user?.role === 'medico';
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleInscricao = async (plantaoId: string) => {
    setLoadingId(plantaoId);
    try {
      const response = await axios.post(`/api/plantoes/${plantaoId}/inscricao`);
      toast.success(response.data.message || 'Inscrição realizada com sucesso!', {
        description: 'Você receberá um email de confirmação em breve.',
      });
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        'Erro ao realizar inscrição. Tente novamente.';
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const dataFormatada = format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Plantões de {dataFormatada}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {plantoes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                Nenhum plantão disponível
              </p>
              <p className="text-gray-400 text-sm">
                Não há plantões cadastrados para esta data.
              </p>
            </div>
          ) : (
            plantoes.map((plantao) => (
              <PlantaoCard
                key={plantao.id}
                plantao={plantao}
                isMedico={isMedico}
                onInscricao={handleInscricao}
                isLoading={loadingId === plantao.id}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PlantaoCardProps {
  plantao: Plantao;
  isMedico: boolean;
  onInscricao: (plantaoId: string) => void;
  isLoading: boolean;
}

function PlantaoCard({ plantao, isMedico, onInscricao, isLoading }: PlantaoCardProps) {
  const isDisponivel =
    plantao.status === 'disponivel' && plantao.vagasDisponiveis > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white">
      {/* Hospital and Specialty Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {plantao.hospital}
          </h3>
          <p className="text-sm text-blue-600 font-semibold">
            {plantao.especialidade}
          </p>
        </div>
        <StatusBadge status={plantao.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DetailItem icon={Clock} label="Horário">
          {plantao.horarioInicio} - {plantao.horarioFim}
        </DetailItem>
        <DetailItem icon={MapPin} label="Local">
          {plantao.cidade}, {plantao.estado}
        </DetailItem>
        <DetailItem icon={DollarSign} label="Valor">
          R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </DetailItem>
        <DetailItem icon={Users} label="Vagas">
          {plantao.vagasDisponiveis} de {plantao.vagasTotal} disponíveis
        </DetailItem>
      </div>

      {/* Description */}
      {plantao.descricao && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                Descrição:
              </p>
              <p className="text-sm text-gray-600">{plantao.descricao}</p>
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      {plantao.requisitos && plantao.requisitos.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs font-semibold text-amber-900 mb-2">
            Requisitos:
          </p>
          <ul className="space-y-1.5">
            {plantao.requisitos.map((req, index) => (
              <li
                key={index}
                className="text-sm text-amber-800 flex items-start gap-2"
              >
                <span className="text-amber-600 mt-1">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      {isMedico && (
        <Button
          onClick={() => onInscricao(plantao.id)}
          disabled={!isDisponivel || isLoading}
          className="w-full mt-2"
          variant={isDisponivel ? 'default' : 'outline'}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscrevendo...
            </>
          ) : isDisponivel ? (
            'Inscrever-se neste Plantão'
          ) : plantao.status === 'cancelado' ? (
            'Plantão Cancelado'
          ) : (
            'Vagas Esgotadas'
          )}
        </Button>
      )}
    </div>
  );
}

// Helper Components
interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

function DetailItem({ icon: Icon, label, children }: DetailItemProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">
          {children}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    disponivel: 'bg-green-100 text-green-800 ring-green-600/20',
    preenchido: 'bg-gray-100 text-gray-800 ring-gray-600/20',
    cancelado: 'bg-red-100 text-red-800 ring-red-600/20',
  };

  const labels = {
    disponivel: 'Disponível',
    preenchido: 'Preenchido',
    cancelado: 'Cancelado',
  };

  return (
    <Badge
      className={`px-3 py-1 text-xs font-semibold ring-1 ${
        colors[status as keyof typeof colors] || colors.disponivel
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
}
