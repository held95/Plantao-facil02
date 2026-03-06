export interface Coordenador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  crm?: string;
  especialidade?: string;
  hospital?: string;
  ativo: boolean;
  avatar?: string;
  totalPlantoesGerenciados: number;
  createdAt: string;
}
