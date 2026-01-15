/**
 * Recovery code utilities for cross-device profile recovery
 * Generates human-readable codes like "BEER-1234-WINE-5678"
 */

const WORDS = [
  "BEER",
  "WINE",
  "PINT",
  "SHOT",
  "BREW",
  "MALT",
  "HOPS",
  "CASK",
  "LAGER",
  "STOUT",
  "AMBER",
  "GOLD",
];

/**
 * Generate a random word from the word list
 */
function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

/**
 * Generate a random 4-digit number (1000-9999)
 */
function getRandomNum(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a human-readable recovery code
 * Format: WORD-1234-WORD-5678
 * @returns A unique recovery code
 */
export function generateRecoveryCode(): string {
  return `${getRandomWord()}-${getRandomNum()}-${getRandomWord()}-${getRandomNum()}`;
}

/**
 * Validate recovery code format
 * @param code The code to validate
 * @returns true if format is valid
 */
export function isValidRecoveryCode(code: string): boolean {
  if (!code) return false;
  const pattern = /^[A-Z]{4,5}-\d{4}-[A-Z]{4,5}-\d{4}$/;
  return pattern.test(code.toUpperCase().trim());
}

/**
 * Format recovery code for display (uppercase, trimmed)
 * @param code The code to format
 * @returns Formatted code
 */
export function formatRecoveryCode(code: string): string {
  return code.toUpperCase().trim();
}
