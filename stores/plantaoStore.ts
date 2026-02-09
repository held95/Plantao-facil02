import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plantao } from '@/types/plantao';

interface PlantaoState {
  plantoes: Plantao[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setPlantoes: (plantoes: Plantao[]) => void;
  addPlantao: (plantao: Plantao) => void;
  updatePlantao: (id: string, plantao: Partial<Plantao>) => void;
  deletePlantao: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePlantaoStore = create<PlantaoState>()(
  persist(
    (set) => ({
      plantoes: [],
      isLoading: false,
      error: null,

      setPlantoes: (plantoes) =>
        set({ plantoes, error: null }),

      addPlantao: (plantao) =>
        set((state) => ({
          plantoes: [...state.plantoes, plantao],
          error: null,
        })),

      updatePlantao: (id, updates) =>
        set((state) => ({
          plantoes: state.plantoes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          error: null,
        })),

      deletePlantao: (id) =>
        set((state) => ({
          plantoes: state.plantoes.filter((p) => p.id !== id),
          error: null,
        })),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setError: (error) =>
        set({ error, isLoading: false }),

      clearError: () =>
        set({ error: null }),
    }),
    {
      name: 'plantao-storage',
      partialize: (state) => ({
        plantoes: state.plantoes,
      }),
    }
  )
);
