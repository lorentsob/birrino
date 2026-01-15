/**
 * PIN utilities for username + PIN authentication
 * Handles validation, formatting, and client-side hashing
 */

/**
 * Validate that a PIN is exactly 4 digits
 * @param pin The PIN to validate
 * @returns true if valid 4-digit PIN
 */
export function isValidPin(pin: string): boolean {
  if (!pin) return false;
  const cleaned = pin.trim();
  return /^\d{4}$/.test(cleaned);
}

/**
 * Format PIN input (remove non-digits, limit to 4 chars)
 * @param input Raw user input
 * @returns Cleaned PIN string
 */
export function formatPinInput(input: string): string {
  return input.replace(/\D/g, "").slice(0, 4);
}

/**
 * Hash PIN using SHA-256 for client-side pre-hashing
 * The server will do additional hashing with pgcrypto
 * @param pin The PIN to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
