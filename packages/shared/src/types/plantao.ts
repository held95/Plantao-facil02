// Tipos para o sistema de Plantões Médicos
import type { RecurrenceRule } from './recurrence';

export interface Plantao {
  id: string;
  hospital: string;
  especialidade: string;
  data: string; // ISO date string
  horarioInicio: string; // "07:00"
  horarioFim: string; // "19:00"
  valor: number;
  status: 'disponivel' | 'preenchido' | 'cancelado';
  descricao?: string;
  requisitos?: string[];
  vagasDisponiveis: number;
  vagasTotal: number;
  cidade: string;
  estado: string;
  criadoPor?: string; // userId de quem criou o plantão
  recurrenceId?: string;
  recurrenceRule?: RecurrenceRule;
}

export interface InscricaoPlantao {
  plantaoId: string;
  medicoNome: string;
  medicoEmail: string;
  medicoCRM: string;
  dataInscricao: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
}
