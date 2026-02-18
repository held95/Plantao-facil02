import { mockUsers } from '@/lib/data/mockUsers';
import { validateBrazilianPhone, formatToBrazilianE164 } from '@/lib/utils/phoneFormatter';

export async function getUsersEligibleForSMS(): Promise<string[]> {
  const phones: string[] = [];
  for (const user of mockUsers) {
    if (!user.ativo) continue;
    if (!user.preferenciasNotificacao?.novosPlantoes) continue;
    if (!user.telefone) continue;
    if (!validateBrazilianPhone(user.telefone)) {
      console.warn("SMS: Telefone invalido para " + user.nome + ": " + user.telefone);
      continue;
    }
    const phoneE164 = formatToBrazilianE164(user.telefone);
    if (phoneE164) phones.push(phoneE164);
  }
  return [...new Set(phones)];
}

export async function getUsersEligibleForEmail(): Promise<{ nome: string; email: string }[]> {
  const recipients: { nome: string; email: string }[] = [];
  const seenEmails = new Set<string>();
  for (const user of mockUsers) {
    if (!user.ativo) continue;
    if (!user.preferenciasNotificacao?.novosPlantoes) continue;
    const emailDestino = user.emailNotificacao || user.email;
    if (!emailDestino || seenEmails.has(emailDestino)) continue;
    seenEmails.add(emailDestino);
    recipients.push({ nome: user.nome, email: emailDestino });
  }
  return recipients;
}
