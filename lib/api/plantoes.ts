import apiClient from './client';
import { Plantao } from '@/types/plantao';
import { PlantaoFormData } from '@/lib/validation/plantaoValidation';

export interface CreatePlantaoResponse {
  success: boolean;
  plantao: Plantao;
  message: string;
}

export interface ApiError {
  error: string;
  validationErrors?: Array<{ field: string; message: string }>;
}

export const plantaoApi = {
  async getAll(): Promise<Plantao[]> {
    try {
      const response = await apiClient.get('/api/plantoes');
      return response.data.plantoes || [];
    } catch (error) {
      console.error('Error fetching plantoes:', error);
      return [];
    }
  },

  async create(data: PlantaoFormData): Promise<CreatePlantaoResponse> {
    const response = await apiClient.post('/api/plantoes', data);
    return response.data;
  },

  async getById(id: string): Promise<Plantao> {
    const response = await apiClient.get(`/api/plantoes/${id}`);
    return response.data.plantao;
  },

  async update(
    id: string,
    data: Partial<PlantaoFormData>
  ): Promise<Plantao> {
    const response = await apiClient.put(`/api/plantoes/${id}`, data);
    return response.data.plantao;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/plantoes/${id}`);
  },
};
