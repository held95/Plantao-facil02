// Field formatting utilities for Brazilian formats (CPF, CRM, etc.)
import type { DocumentType, HospitalLayout } from '../types/document';

export function formatCPF(cpf: string | undefined): string {
  if (!cpf) return 'Não informado';
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return cpf;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCRM(crm: string | undefined): string {
  if (!crm) return 'Não informado';
  const numbers = crm.replace(/\D/g, '');
  if (numbers.length >= 5 && numbers.length <= 7) {
    return `CRM ${numbers}`;
  }
  return crm;
}

export function formatRG(rg: string | undefined): string {
  if (!rg) return 'Não informado';
  const cleaned = rg.replace(/[^0-9X]/gi, '');
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
  return rg;
}

export function formatCNS(cns: string | undefined): string {
  if (!cns) return 'Não informado';
  const numbers = cns.replace(/\D/g, '');
  if (numbers.length === 15) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }
  return cns;
}

export function formatPhone(phone: string | undefined): string {
  if (!phone) return 'Não informado';
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return 'text-green-600 bg-green-50';
  if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 85) return 'Alta';
  if (confidence >= 70) return 'Média';
  return 'Baixa';
}

export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    SURGICAL_REPORT: 'Relatório Cirúrgico',
    MEDICAL_RECORD: 'Prontuário Médico',
    PRESCRIPTION: 'Receita Médica',
    EXAM_RESULT: 'Resultado de Exame',
    MEDICAL_CERTIFICATE: 'Atestado Médico',
    UNKNOWN: 'Tipo Desconhecido',
  };
  return labels[type] || 'Não identificado';
}

export function getHospitalLayoutLabel(layout: HospitalLayout): string {
  const labels: Record<HospitalLayout, string> = {
    HMB: 'Hospital Municipal de Barueri',
    HGP: 'Hospital Geral de Pirajussara',
    SOROCABA: 'Hospital Regional de Sorocaba',
    GUARULHOS: 'SPDM Guarulhos',
    GENERIC: 'SPDM Genérico',
    UNKNOWN: 'Layout Desconhecido',
  };
  return labels[layout] || 'Não identificado';
}

export function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function formatMedicalRecord(rh: string | undefined): string {
  if (!rh) return 'Não informado';
  return `RH ${rh}`;
}

export function formatAge(idade: string | undefined): string {
  if (!idade) return 'Não informado';
  return `${idade} anos`;
}

export function formatGender(sexo: string | undefined): string {
  if (!sexo) return 'Não informado';
  const genders: Record<string, string> = {
    MASCULINO: 'Masculino',
    FEMININO: 'Feminino',
    M: 'Masculino',
    F: 'Feminino',
  };
  return genders[sexo.toUpperCase()] || sexo;
}

export function cleanProcedureText(procedimento: string | undefined): string {
  if (!procedimento) return 'Não informado';
  return procedimento
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}
