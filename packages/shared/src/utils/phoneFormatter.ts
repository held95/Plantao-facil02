/**
 * Phone Formatter Utility — Brazilian phone numbers (E.164 format for AWS SNS)
 */

export function formatToBrazilianE164(phone: string): string {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');
  let formattedPhone = digitsOnly;

  if (formattedPhone.startsWith('55')) {
    formattedPhone = formattedPhone.substring(2);
  }

  if (formattedPhone.length === 13) {
    formattedPhone = formattedPhone.substring(2);
  }

  if (formattedPhone.length !== 11) {
    console.warn(`Invalid phone number length: ${formattedPhone.length} digits`);
    return '';
  }

  if (!formattedPhone.startsWith('9', 2)) {
    console.warn('Phone number must be mobile (should start with 9)');
    return '';
  }

  return `+55${formattedPhone}`;
}

export function validateBrazilianPhone(phone: string): boolean {
  if (!phone) return false;

  const digitsOnly = phone.replace(/\D/g, '');
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55')) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  if (cleanedPhone.length !== 11) return false;
  if (!cleanedPhone.startsWith('9', 2)) return false;

  const areaCode = parseInt(cleanedPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  return true;
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55') && cleanedPhone.length > 11) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  if (cleanedPhone.length === 11) {
    return `(${cleanedPhone.substring(0, 2)}) ${cleanedPhone.substring(2, 7)}-${cleanedPhone.substring(7)}`;
  }

  if (cleanedPhone.length === 10) {
    return `(${cleanedPhone.substring(0, 2)}) ${cleanedPhone.substring(2, 6)}-${cleanedPhone.substring(6)}`;
  }

  return phone;
}

export function extractAreaCode(phone: string): string {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55') && cleanedPhone.length > 11) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  if (cleanedPhone.length >= 10) {
    return cleanedPhone.substring(0, 2);
  }

  return '';
}

export function isMobileNumber(phone: string): boolean {
  if (!phone) return false;

  const digitsOnly = phone.replace(/\D/g, '');
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55') && cleanedPhone.length > 11) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  return cleanedPhone.length >= 11 && cleanedPhone.charAt(2) === '9';
}
