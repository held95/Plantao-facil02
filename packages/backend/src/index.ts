// Auth
export { auth, signIn, signOut, handlers } from './auth/index';
export { authConfig } from './auth/config';

// Repositories
export { authUserRepository } from './repositories/authRepository';
export { plantaoRepository } from './repositories/plantaoRepository';
export { documentRepository } from './repositories/documentRepository';
export { swapRepository } from './repositories/swapRepository';
export { logRepository } from './repositories/logRepository';
export { messageRepository } from './repositories/messageRepository';
export type { Mensagem, MensagemAnexo } from './repositories/messageRepository';

// AWS
export { getDynamoDocumentClient } from './aws/dynamo/client';
export { documentStorage } from './aws/s3/documentStorage';

// Route Guards
export {
  requireAuth,
  requireRole,
  requireCoordinator,
  requireAdmin,
  requireMedico,
} from './api/routeGuards';
export type { AuthResult } from './api/routeGuards';
