// Documents API Functions
import apiClient from './client';
import type { Document, DocumentListResponse, ApiError } from '@/types/document';

/**
 * Fetch all documents with optional pagination
 * @param limit - Number of documents to fetch (default: 100)
 * @param nextToken - Pagination token for next page
 * @returns Promise with document list response
 */
export async function getDocuments(
  limit: number = 100,
  nextToken?: string
): Promise<DocumentListResponse> {
  try {
    const params: Record<string, string | number> = { limit };
    if (nextToken) {
      params.nextToken = nextToken;
    }

    const response = await apiClient.get<DocumentListResponse>('/documents', {
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Fetch a single document by ID
 * @param id - Document ID
 * @returns Promise with document data
 */
export async function getDocumentById(id: string): Promise<Document> {
  try {
    const response = await apiClient.get<Document>(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    throw error;
  }
}

/**
 * Health check endpoint
 * @returns Promise with health status
 */
export async function getHealthCheck(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await apiClient.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
}

/**
 * Client-side filtering of documents
 * Note: API doesn't support server-side filtering yet
 * This function filters documents in memory
 */
export function filterDocuments(
  documents: Document[],
  filters: {
    search?: string;
    documentType?: string;
    hospital?: string;
    specialty?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minConfidence?: number;
  }
): Document[] {
  return documents.filter((doc) => {
    // Search filter (patient name, hospital, procedure)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        doc.nomePaciente?.toLowerCase().includes(searchLower) ||
        doc.nomeHospital?.toLowerCase().includes(searchLower) ||
        doc.cirurgiaProposta?.toLowerCase().includes(searchLower) ||
        doc.nomeMedico?.toLowerCase().includes(searchLower) ||
        doc.cirurgiao?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Document type filter
    if (filters.documentType && doc.documentType !== filters.documentType) {
      return false;
    }

    // Hospital filter
    if (filters.hospital && doc.nomeHospital !== filters.hospital) {
      return false;
    }

    // Specialty filter
    if (filters.specialty && doc.especialidade !== filters.specialty) {
      return false;
    }

    // Date range filter (using processedAt)
    if (filters.dateFrom || filters.dateTo) {
      const docDate = new Date(doc.processedAt);

      if (filters.dateFrom && docDate < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && docDate > filters.dateTo) {
        return false;
      }
    }

    // Confidence filter
    if (filters.minConfidence && doc.confidence < filters.minConfidence) {
      return false;
    }

    return true;
  });
}

/**
 * Sort documents by different criteria
 */
export function sortDocuments(
  documents: Document[],
  sortBy: 'date-desc' | 'date-asc' | 'confidence-desc' | 'confidence-asc' | 'name-asc' | 'name-desc'
): Document[] {
  return [...documents].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime();
      case 'date-asc':
        return new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime();
      case 'confidence-desc':
        return b.confidence - a.confidence;
      case 'confidence-asc':
        return a.confidence - b.confidence;
      case 'name-asc':
        return (a.nomePaciente || '').localeCompare(b.nomePaciente || '', 'pt-BR');
      case 'name-desc':
        return (b.nomePaciente || '').localeCompare(a.nomePaciente || '', 'pt-BR');
      default:
        return 0;
    }
  });
}
