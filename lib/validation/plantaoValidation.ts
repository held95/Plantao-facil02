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

  // Required fields
  if (!data.titulo?.trim()) {
    errors.push({ field: 'titulo', message: 'Título é obrigatório' });
  } else if (data.titulo.trim().length < 5) {
    errors.push({
      field: 'titulo',
      message: 'Título deve ter pelo menos 5 caracteres',
    });
  }

  if (!data.hospital?.trim()) {
    errors.push({ field: 'hospital', message: 'Hospital é obrigatório' });
  }

  if (!data.especialidade) {
    errors.push({
      field: 'especialidade',
      message: 'Especialidade é obrigatória',
    });
  }

  if (!data.descricao?.trim()) {
    errors.push({ field: 'descricao', message: 'Descrição é obrigatória' });
  } else if (data.descricao.trim().length < 10) {
    errors.push({
      field: 'descricao',
      message: 'Descrição deve ter pelo menos 10 caracteres',
    });
  }

  // Date validation
  if (!data.data) {
    errors.push({ field: 'data', message: 'Data é obrigatória' });
  } else {
    const selectedDate = new Date(data.data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      errors.push({ field: 'data', message: 'Data inválida' });
    } else if (selectedDate < today) {
      errors.push({
        field: 'data',
        message: 'Data não pode ser no passado',
      });
    }
  }

  // Time validations
  if (!data.horarioInicio) {
    errors.push({
      field: 'horarioInicio',
      message: 'Horário de início é obrigatório',
    });
  }

  if (!data.horarioFim) {
    errors.push({
      field: 'horarioFim',
      message: 'Horário de término é obrigatório',
    });
  }

  // Validate end time is after start time
  if (data.horarioInicio && data.horarioFim) {
    if (data.horarioInicio >= data.horarioFim) {
      errors.push({
        field: 'horarioFim',
        message: 'Horário de término deve ser depois do início',
      });
    }
  }

  if (!data.cidade?.trim()) {
    errors.push({ field: 'cidade', message: 'Cidade é obrigatória' });
  }

  if (!data.estado) {
    errors.push({ field: 'estado', message: 'Estado é obrigatório' });
  }

  // Numeric validations
  const valor = parseFloat(data.valor);
  if (!data.valor || isNaN(valor)) {
    errors.push({ field: 'valor', message: 'Valor é obrigatório' });
  } else if (valor <= 0) {
    errors.push({
      field: 'valor',
      message: 'Valor deve ser maior que zero',
    });
  } else if (valor > 50000) {
    errors.push({
      field: 'valor',
      message: 'Valor não pode exceder R$ 50.000',
    });
  }

  const vagasTotal = parseInt(data.vagasTotal);
  if (!data.vagasTotal || isNaN(vagasTotal)) {
    errors.push({
      field: 'vagasTotal',
      message: 'Número de vagas é obrigatório',
    });
  } else if (vagasTotal <= 0) {
    errors.push({
      field: 'vagasTotal',
      message: 'Deve ter pelo menos 1 vaga',
    });
  } else if (vagasTotal > 50) {
    errors.push({
      field: 'vagasTotal',
      message: 'Máximo de 50 vagas por plantão',
    });
  }

  return errors;
}

export function formatPlantaoForSubmission(
  data: PlantaoFormData
): Omit<Plantao, 'id'> {
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
