import { Plantao } from '@/types/plantao';

export interface PlantaoFormData {
  titulo: string;
  hospital: string;
  especialidade: string;
  descricao: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  cidade: string;
  estado: string;
  valor: string;
  vagasTotal: string;
  status: 'disponivel' | 'preenchido' | 'cancelado';
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePlantaoForm(data: PlantaoFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.hospital?.trim()) {
    errors.push({ field: 'hospital', message: 'Hospital e obrigatorio' });
  }

  if (!data.especialidade) {
    errors.push({ field: 'especialidade', message: 'Especialidade e obrigatoria' });
  }

  if (!data.descricao?.trim()) {
    errors.push({ field: 'descricao', message: 'Descricao e obrigatoria' });
  } else if (data.descricao.trim().length < 10) {
    errors.push({ field: 'descricao', message: 'Descricao deve ter pelo menos 10 caracteres' });
  }

  if (!data.data) {
    errors.push({ field: 'data', message: 'Data e obrigatoria' });
  } else {
    const selectedDate = new Date(data.data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate.getTime())) {
      errors.push({ field: 'data', message: 'Data invalida' });
    } else if (selectedDate < today) {
      errors.push({ field: 'data', message: 'Data nao pode ser no passado' });
    }
  }

  if (!data.horarioInicio) {
    errors.push({ field: 'horarioInicio', message: 'Horario de inicio e obrigatorio' });
  }

  if (!data.horarioFim) {
    errors.push({ field: 'horarioFim', message: 'Horario de termino e obrigatorio' });
  }

  // Plantoes noturnos (ex: 19:00 -> 07:00) sao normais na medicina.
  // Nao validamos se termino < inicio pois o plantao pode passar da meia-noite.

  if (!data.cidade?.trim()) {
    errors.push({ field: 'cidade', message: 'Cidade e obrigatoria' });
  }

  if (!data.estado) {
    errors.push({ field: 'estado', message: 'Estado e obrigatorio' });
  }

  const valor = parseFloat(data.valor);
  if (!data.valor || isNaN(valor)) {
    errors.push({ field: 'valor', message: 'Valor e obrigatorio' });
  } else if (valor <= 0) {
    errors.push({ field: 'valor', message: 'Valor deve ser maior que zero' });
  } else if (valor > 50000) {
    errors.push({ field: 'valor', message: 'Valor nao pode exceder R$ 50.000' });
  }

  const vagasTotal = parseInt(data.vagasTotal);
  if (!data.vagasTotal || isNaN(vagasTotal)) {
    errors.push({ field: 'vagasTotal', message: 'Numero de vagas e obrigatorio' });
  } else if (vagasTotal <= 0) {
    errors.push({ field: 'vagasTotal', message: 'Deve ter pelo menos 1 vaga' });
  } else if (vagasTotal > 50) {
    errors.push({ field: 'vagasTotal', message: 'Maximo de 50 vagas por plantao' });
  }

  return errors;
}

export function formatPlantaoForSubmission(
  data: PlantaoFormData
): Omit<Plantao, 'id'> {
  // Titulo: usa o informado ou gera automaticamente
  const tituloFinal = data.titulo?.trim() ||
    (data.especialidade && data.hospital
      ? data.especialidade + ' - ' + data.hospital
      : 'Plantao');

  return {
    hospital: data.hospital.trim(),
    especialidade: data.especialidade,
    data: new Date(data.data).toISOString(),
    horarioInicio: data.horarioInicio,
    horarioFim: data.horarioFim,
    valor: parseFloat(data.valor),
    status: data.status || 'disponivel',
    descricao: data.descricao.trim(),
    requisitos: [],
    vagasDisponiveis: parseInt(data.vagasTotal),
    vagasTotal: parseInt(data.vagasTotal),
    cidade: data.cidade.trim(),
    estado: data.estado,
  };
}
