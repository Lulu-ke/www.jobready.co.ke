/**
 * Normalize a Kenyan phone number to 254XXXXXXXXX format.
 *
 * Handles various input formats:
 *   0712345678  →  254712345678
 *   +254712345678  →  254712345678
 *   254712345678  →  254712345678
 *   712345678  →  254712345678
 *
 * Returns null if the phone cannot be normalized to a valid 12-digit Kenyan number.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') return null;

  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Already in 254XXXXXXXXX format
  if (/^254[71]\d{8}$/.test(cleaned)) return cleaned;

  // +254XXXXXXXXX
  if (/^\+254[71]\d{8}$/.test(cleaned)) return cleaned.slice(1);

  // 07XXXXXXXX or 01XXXXXXXX
  if (/^0[71]\d{8}$/.test(cleaned)) return '254' + cleaned.slice(1);

  // 7XXXXXXXX or 1XXXXXXXX (9 digits)
  if (/^[71]\d{8}$/.test(cleaned)) return '254' + cleaned;

  return null;
}
