import { UserRole } from './user';

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
