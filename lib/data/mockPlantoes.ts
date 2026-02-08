// Dados mockados de plantões para demonstração
import type { Plantao } from '@/types/plantao';

export const mockPlantoes: Plantao[] = [
  {
    id: '1',
    hospital: 'Hospital Municipal de Barueri',
    especialidade: 'Clínica Geral',
    data: '2026-02-15T00:00:00Z',
    horarioInicio: '07:00',
    horarioFim: '19:00',
    valor: 1200,
    status: 'disponivel',
    descricao: 'Plantão diurno de 12 horas na ala de clínica geral',
    requisitos: ['CRM ativo', 'Experiência mínima de 2 anos'],
    vagasDisponiveis: 2,
    vagasTotal: 3,
    cidade: 'Barueri',
    estado: 'SP',
  },
  {
    id: '2',
    hospital: 'Hospital Regional de Sorocaba',
    especialidade: 'Cirurgia Geral',
    data: '2026-02-16T00:00:00Z',
    horarioInicio: '19:00',
    horarioFim: '07:00',
    valor: 1800,
    status: 'disponivel',
    descricao: 'Plantão noturno de 12 horas no centro cirúrgico',
    requisitos: ['CRM ativo', 'Especialização em Cirurgia Geral', 'ATLS'],
    vagasDisponiveis: 1,
    vagasTotal: 2,
    cidade: 'Sorocaba',
    estado: 'SP',
  },
  {
    id: '3',
    hospital: 'Hospital Geral de Guarulhos',
    especialidade: 'Pediatria',
    data: '2026-02-17T00:00:00Z',
    horarioInicio: '07:00',
    horarioFim: '13:00',
    valor: 800,
    status: 'disponivel',
    descricao: 'Plantão matinal de 6 horas na pediatria',
    requisitos: ['CRM ativo', 'Residência em Pediatria'],
    vagasDisponiveis: 3,
    vagasTotal: 3,
    cidade: 'Guarulhos',
    estado: 'SP',
  },
  {
    id: '4',
    hospital: 'Hospital Santa Casa',
    especialidade: 'Ortopedia',
    data: '2026-02-18T00:00:00Z',
    horarioInicio: '13:00',
    horarioFim: '19:00',
    valor: 900,
    status: 'disponivel',
    descricao: 'Plantão vespertino de 6 horas na ortopedia',
    requisitos: ['CRM ativo', 'Especialização em Ortopedia'],
    vagasDisponiveis: 1,
    vagasTotal: 2,
    cidade: 'São Paulo',
    estado: 'SP',
  },
  {
    id: '5',
    hospital: 'Hospital Municipal de Barueri',
    especialidade: 'Pronto Socorro',
    data: '2026-02-19T00:00:00Z',
    horarioInicio: '19:00',
    horarioFim: '07:00',
    valor: 1500,
    status: 'disponivel',
    descricao: 'Plantão noturno de 12 horas no pronto socorro',
    requisitos: ['CRM ativo', 'ACLS', 'Experiência em urgência'],
    vagasDisponiveis: 2,
    vagasTotal: 3,
    cidade: 'Barueri',
    estado: 'SP',
  },
  {
    id: '6',
    hospital: 'Hospital Regional de Sorocaba',
    especialidade: 'Cardiologia',
    data: '2026-02-20T00:00:00Z',
    horarioInicio: '07:00',
    horarioFim: '19:00',
    valor: 2000,
    status: 'disponivel',
    descricao: 'Plantão diurno de 12 horas na cardiologia',
    requisitos: ['CRM ativo', 'Título de Especialista em Cardiologia', 'ACLS'],
    vagasDisponiveis: 1,
    vagasTotal: 1,
    cidade: 'Sorocaba',
    estado: 'SP',
  },
  {
    id: '7',
    hospital: 'Hospital Zona Sul',
    especialidade: 'Clínica Geral',
    data: '2026-02-21T00:00:00Z',
    horarioInicio: '07:00',
    horarioFim: '19:00',
    valor: 1100,
    status: 'preenchido',
    descricao: 'Plantão diurno de 12 horas - PREENCHIDO',
    requisitos: ['CRM ativo'],
    vagasDisponiveis: 0,
    vagasTotal: 2,
    cidade: 'São Paulo',
    estado: 'SP',
  },
  {
    id: '8',
    hospital: 'Hospital Geral de Guarulhos',
    especialidade: 'Ginecologia e Obstetrícia',
    data: '2026-02-22T00:00:00Z',
    horarioInicio: '19:00',
    horarioFim: '07:00',
    valor: 1700,
    status: 'disponivel',
    descricao: 'Plantão noturno de 12 horas na maternidade',
    requisitos: ['CRM ativo', 'Residência em GO', 'ALSO'],
    vagasDisponiveis: 2,
    vagasTotal: 2,
    cidade: 'Guarulhos',
    estado: 'SP',
  },
];

// Função para obter todos os plantões
export function getTodosPlantoes(): Plantao[] {
  return mockPlantoes;
}

// Função para obter plantões disponíveis
export function getPlantoesDisponiveis(): Plantao[] {
  return mockPlantoes.filter(p => p.status === 'disponivel' && p.vagasDisponiveis > 0);
}

// Função para obter um plantão por ID
export function getPlantaoPorId(id: string): Plantao | undefined {
  return mockPlantoes.find(p => p.id === id);
}

// Função para filtrar plantões por especialidade
export function filtrarPorEspecialidade(especialidade: string): Plantao[] {
  return mockPlantoes.filter(p =>
    p.especialidade.toLowerCase().includes(especialidade.toLowerCase()) &&
    p.status === 'disponivel'
  );
}

// Função para filtrar plantões por cidade
export function filtrarPorCidade(cidade: string): Plantao[] {
  return mockPlantoes.filter(p =>
    p.cidade.toLowerCase().includes(cidade.toLowerCase()) &&
    p.status === 'disponivel'
  );
}
