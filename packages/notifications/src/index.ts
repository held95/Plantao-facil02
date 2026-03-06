// Email
export { awsSesService } from './email/awsSesService';
export type { SendEmailResult } from './email/awsSesService';

// SMS
export { awsSnsService } from './sms/awsSnsService';
export {
  getPlantaoCriadoMessage,
  getInscricaoConfirmadaMessage,
  getLembrete24hMessage,
  getLembrete1hMessage,
  getPlantaoCanceladoMessage,
  getPlantaoAtualizadoMessage,
  getNotificacaoGeralMessage,
} from './sms/templates';
export {
  getUsersEligibleForSMS,
  getUsersEligibleForEmail,
  getRecipientsForPlantaoCreated,
} from './sms/notificationHelpers';
export type { UserSource } from './sms/notificationHelpers';

// Push
export { expoPushService } from './push/expoPushService';

// Orchestrator
export { dispatchPlantaoCreated } from './orchestrator';

// Provider interfaces
export type { SmsProvider, EmailProvider, PushProvider, SendResult } from './providers/types';

// Types
export type {
  NotificationEvent,
  NotificationChannel,
  DeliveryStatus,
  NotificationRecipient,
  DeliveryLog,
} from './types';

// Email templates
export { default as PlantaoCriadoEmail } from './templates/PlantaoCriadoEmail';
export { default as InscricaoConfirmadaEmail } from './templates/InscricaoConfirmadaEmail';
