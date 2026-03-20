export interface SwapRequest {
  id: string;
  solicitanteId: string;
  solicitanteNome: string;
  destinatarioId: string;
  destinatarioNome: string;
  plantaoOrigemId: string;
  plantaoDestinoId: string;
  status: 'pendente' | 'aceito' | 'rejeitado' | 'cancelado';
  criadoEm: string;
  resolvidoEm?: string;
}
