/**
 * PIN utilities for username + PIN authentication
 * Handles validation and formatting only — hashing is done server-side by Supabase Auth.
 */

/**
 * Validate that a PIN is exactly 4 digits
 */
export function isValidPin(pin: string): boolean {
  if (!pin) return false;
  return /^\d{4}$/.test(pin.trim());
}

/**
 * Format PIN input (remove non-digits, limit to 4 chars)
 */
export function formatPinInput(input: string): string {
  return input.replace(/\D/g, "").slice(0, 4);
}
