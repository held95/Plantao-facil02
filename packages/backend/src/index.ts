// Auth
export { auth, signIn, signOut, handlers } from './auth/index';
export { authConfig } from './auth/config';

// Repositories
export { authUserRepository } from './repositories/authRepository';
export { plantaoRepository } from './repositories/plantaoRepository';

// AWS
export { getDynamoDocumentClient } from './aws/dynamo/client';

// Route Guards
export {
  requireAuth,
  requireRole,
  requireCoordinator,
  requireAdmin,
  requireMedico,
} from './api/routeGuards';
export type { AuthResult } from './api/routeGuards';
