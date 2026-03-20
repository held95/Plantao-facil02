import type { UserRole, UserApprovalStatus } from './user';

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
  telefone?: string;
  pushTokens?: string[];
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  pushOptIn?: boolean;
  privacyAcceptedAt?: string;
}

export interface PendingUserSummary {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  status: UserApprovalStatus;
  createdAt: string;
}
