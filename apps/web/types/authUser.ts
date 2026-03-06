import { UserRole } from './user';

export type UserApprovalStatus =
  | 'pendente_aprovacao'
  | 'aprovado'
  | 'rejeitado';

export interface AuthUserRecord {
  id: string;
  email: string;
  emailLower: string;
  nome: string;
  role: UserRole;
  status: UserApprovalStatus;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface PendingUserSummary {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  status: UserApprovalStatus;
  createdAt: string;
}

