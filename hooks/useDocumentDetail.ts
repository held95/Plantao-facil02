// TanStack Query hook for fetching a single document
import { useQuery } from '@tanstack/react-query';
import { getDocumentById } from '@/lib/api/documents';
import type { Document } from '@/types/document';

/**
 * Hook to fetch a single document by ID
 * Uses TanStack Query for caching and state management
 */
export function useDocumentDetail(id: string) {
  return useQuery<Document, Error>({
    queryKey: ['document', id],
    queryFn: () => getDocumentById(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    retry: 2,
  });
}
