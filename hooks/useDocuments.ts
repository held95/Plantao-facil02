// TanStack Query hook for fetching documents
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/lib/api/documents';
import type { DocumentListResponse } from '@/types/document';

/**
 * Hook to fetch documents list with pagination
 * Uses TanStack Query for caching and state management
 */
export function useDocuments(limit: number = 50, nextToken?: string) {
  return useQuery<DocumentListResponse, Error>({
    queryKey: ['documents', limit, nextToken],
    queryFn: () => getDocuments(limit, nextToken),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });
}
