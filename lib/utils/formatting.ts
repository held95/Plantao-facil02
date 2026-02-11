// Field formatting utilities for Brazilian formats (CPF, CRM, etc.)
import type { DocumentType, HospitalLayout } from '@/types/document';

/**
 * Format CPF to Brazilian format (123.456.789-00)
 * @param cpf - CPF string (with or without formatting)
 * @returns Formatted CPF
 */
export function formatCPF(cpf: string | undefined): string {
  if (!cpf) return 'Não informado';

  // Remove non-numeric characters
  const numbers = cpf.replace(/\D/g, '');

  // Check if it has the right length
  if (numbers.length !== 11) return cpf;

  // Format: 123.456.789-00
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Format CRM (medical registration number)
 * @param crm - CRM string
 * @returns Formatted CRM
 */
export function formatCRM(crm: string | undefined): string {
  if (!crm) return 'Não informado';

  // Remove non-numeric characters
  const numbers = crm.replace(/\D/g, '');

  // CRM is typically 5-7 digits
  if (numbers.length >= 5 && numbers.length <= 7) {
    return `CRM ${numbers}`;
  }

  return crm;
}

/**
 * Format RG (Brazilian ID)
 * @param rg - RG string
 * @returns Formatted RG
 */
export function formatRG(rg: string | undefined): string {
  if (!rg) return 'Não informado';

  // Remove non-numeric characters except 'X' (some RGs end with X)
  const cleaned = rg.replace(/[^0-9X]/gi, '');

  // Common RG format: XX.XXX.XXX-X (9 digits)
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }

  return rg;
}

/**
 * Format CNS (Cartão Nacional de Saúde - National Health Card)
 * @param cns - CNS string
 * @returns Formatted CNS
 */
export function formatCNS(cns: string | undefined): string {
  if (!cns) return 'Não informado';

  // Remove non-numeric characters
  const numbers = cns.replace(/\D/g, '');

  // CNS has 15 digits: XXX XXXX XXXX XXXX
  if (numbers.length === 15) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }

  return cns;
}

/**
 * Format phone number to Brazilian format
 * @param phone - Phone string
 * @returns Formatted phone
 */
export function formatPhone(phone: string | undefined): string {
  if (!phone) return 'Não informado';

  // Remove non-numeric characters
  const numbers = phone.replace(/\D/g, '');

  // Mobile: (XX) XXXXX-XXXX (11 digits with 9)
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Landline: (XX) XXXX-XXXX (10 digits)
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

/**
 * Get color based on OCR confidence score
 * @param confidence - Confidence score (0-100)
 * @returns Tailwind color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return 'text-green-600 bg-green-50';
  if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

/**
 * Get confidence label
 * @param confidence - Confidence score (0-100)
 * @returns Confidence label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 85) return 'Alta';
  if (confidence >= 70) return 'Média';
  return 'Baixa';
}

/**
 * Get human-readable document type label
 * @param type - Document type enum
 * @returns Portuguese label
 */
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

/**
 * Get human-readable hospital layout name
 * @param layout - Hospital layout enum
 * @returns Portuguese label
 */
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

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format medical record number (RH)
 * @param rh - RH/Prontuário number
 * @returns Formatted RH
 */
export function formatMedicalRecord(rh: string | undefined): string {
  if (!rh) return 'Não informado';
  return `RH ${rh}`;
}

/**
 * Format age display
 * @param idade - Age string
 * @returns Formatted age
 */
export function formatAge(idade: string | undefined): string {
  if (!idade) return 'Não informado';
  return `${idade} anos`;
}

/**
 * Format gender display
 * @param sexo - Gender string
 * @returns Formatted gender
 */
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

/**
 * Clean procedure text (remove extra spaces, line breaks)
 * @param procedimento - Procedure text
 * @returns Cleaned text
 */
export function cleanProcedureText(procedimento: string | undefined): string {
  if (!procedimento) return 'Não informado';

  return procedimento
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace line breaks with space
    .trim();
}
