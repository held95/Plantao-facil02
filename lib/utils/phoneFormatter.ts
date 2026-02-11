/**
 * Phone Formatter Utility
 *
 * Handles Brazilian phone number formatting for SMS integration.
 * Converts various input formats to E.164 format required by Twilio.
 *
 * Brazilian phone format:
 * - Area code: 2 digits (11-99)
 * - Mobile: starts with 9, followed by 8 digits (9xxxx-xxxx)
 * - Landline: 8 digits (xxxx-xxxx)
 *
 * E.164 format for Brazil: +55 XX 9XXXX-XXXX
 * Example: +5511987654321
 */

/**
 * Formats a Brazilian phone number to E.164 format for Twilio
 *
 * @param phone - Phone number in various formats
 * @returns Phone number in E.164 format (+5511987654321)
 *
 * @example
 * formatToBrazilianE164('(11) 98765-4321') // '+5511987654321'
 * formatToBrazilianE164('11987654321')      // '+5511987654321'
 * formatToBrazilianE164('11 9 8765-4321')   // '+5511987654321'
 */
export function formatToBrazilianE164(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Handle different input formats
  let formattedPhone = digitsOnly;

  // If already has country code +55, remove it for processing
  if (formattedPhone.startsWith('55')) {
    formattedPhone = formattedPhone.substring(2);
  }

  // If has 13 digits (country code + area + number), remove country code
  if (formattedPhone.length === 13) {
    formattedPhone = formattedPhone.substring(2);
  }

  // Validate length (should be 11 digits: 2 area code + 9 number)
  if (formattedPhone.length !== 11) {
    console.warn(`Invalid phone number length: ${formattedPhone.length} digits`);
    return '';
  }

  // Validate mobile number (must start with 9)
  if (!formattedPhone.startsWith('9', 2)) {
    console.warn('Phone number must be mobile (should start with 9)');
    return '';
  }

  // Return in E.164 format
  return `+55${formattedPhone}`;
}

/**
 * Validates if a string is a valid Brazilian mobile phone number
 *
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * validateBrazilianPhone('(11) 98765-4321') // true
 * validateBrazilianPhone('123')              // false
 * validateBrazilianPhone('(11) 3333-4444')   // false (landline)
 */
export function validateBrazilianPhone(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Remove country code if present
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55')) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  // Check length (11 digits: 2 area code + 9 number)
  if (cleanedPhone.length !== 11) {
    return false;
  }

  // Check if it's a mobile number (3rd digit must be 9)
  if (!cleanedPhone.startsWith('9', 2)) {
    return false;
  }

  // Validate area code (11-99)
  const areaCode = parseInt(cleanedPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) {
    return false;
  }

  return true;
}

/**
 * Formats phone number for display in Brazilian format
 *
 * @param phone - Phone number in any format
 * @returns Formatted string: (XX) 9XXXX-XXXX
 *
 * @example
 * maskPhoneNumber('+5511987654321')  // '(11) 98765-4321'
 * maskPhoneNumber('11987654321')     // '(11) 98765-4321'
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Remove country code if present
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55') && cleanedPhone.length > 11) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  // Format: (XX) 9XXXX-XXXX
  if (cleanedPhone.length === 11) {
    return `(${cleanedPhone.substring(0, 2)}) ${cleanedPhone.substring(
      2,
      7
    )}-${cleanedPhone.substring(7)}`;
  }

  // Format: (XX) XXXX-XXXX (landline)
  if (cleanedPhone.length === 10) {
    return `(${cleanedPhone.substring(0, 2)}) ${cleanedPhone.substring(
      2,
      6
    )}-${cleanedPhone.substring(6)}`;
  }

  // Return as-is if invalid format
  return phone;
}

/**
 * Extracts area code from Brazilian phone number
 *
 * @param phone - Phone number in any format
 * @returns Area code (2 digits) or empty string
 *
 * @example
 * extractAreaCode('(11) 98765-4321') // '11'
 * extractAreaCode('+5521987654321')  // '21'
 */
export function extractAreaCode(phone: string): string {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');

  // Remove country code if present
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55') && cleanedPhone.length > 11) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  // Return first 2 digits (area code)
  if (cleanedPhone.length >= 10) {
    return cleanedPhone.substring(0, 2);
  }

  return '';
}

/**
 * Checks if phone number is mobile (starts with 9)
 *
 * @param phone - Phone number in any format
 * @returns true if mobile, false if landline or invalid
 */
export function isMobileNumber(phone: string): boolean {
  if (!phone) return false;

  const digitsOnly = phone.replace(/\D/g, '');

  // Remove country code if present
  let cleanedPhone = digitsOnly;
  if (cleanedPhone.startsWith('55') && cleanedPhone.length > 11) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  // Check if 3rd digit is 9 (mobile indicator)
  return cleanedPhone.length >= 11 && cleanedPhone.charAt(2) === '9';
}
