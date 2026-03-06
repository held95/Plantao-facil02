import { validateBrazilianPhone, formatToBrazilianE164 } from '@plantao/shared';
import type { NotificationRecipient } from '../types';

/**
 * UserSource abstraction — decouples notification helpers from any specific data store.
 * In production, inject a function that fetches from your user repository.
 * In mock/test mode, pass the mock user source.
 */
export type UserSource = () => Promise<NotificationRecipient[]>;

export async function getUsersEligibleForSMS(
  getUsersFn: UserSource
): Promise<string[]> {
  const recipients = await getUsersFn();
  const phones: string[] = [];

  for (const r of recipients) {
    if (!r.smsEnabled) continue;
    if (!r.phone) continue;
    if (!validateBrazilianPhone(r.phone)) {
      console.warn(`[notificationHelpers] SMS: Telefone invalido para ${r.nome}: ${r.phone}`);
      continue;
    }
    const phoneE164 = formatToBrazilianE164(r.phone);
    if (phoneE164) phones.push(phoneE164);
  }

  return [...new Set(phones)];
}

export async function getUsersEligibleForEmail(
  getUsersFn: UserSource
): Promise<{ nome: string; email: string }[]> {
  const recipients = await getUsersFn();
  const result: { nome: string; email: string }[] = [];
  const seenEmails = new Set<string>();

  for (const r of recipients) {
    if (!r.emailEnabled) continue;
    if (!r.email || seenEmails.has(r.email)) continue;
    seenEmails.add(r.email);
    result.push({ nome: r.nome, email: r.email });
  }

  return result;
}

export async function getRecipientsForPlantaoCreated(
  getUsersFn: UserSource
): Promise<NotificationRecipient[]> {
  return getUsersFn();
}
