/**
 * Application-wide constants for Birrino
 */

/**
 * Weekly alcohol unit limit according to health guidelines
 * Based on Italian National Health Service recommendations
 */
export const WEEKLY_UNIT_LIMIT = 14;

/**
 * Monthly alcohol unit estimate (approximately 14 × 4.3 weeks)
 */
export const MONTHLY_UNIT_ESTIMATE = 60;

/**
 * Maximum minutes to display on drive timer progress ring
 * Equivalent to 4 hours
 */
export const DRIVE_TIMER_MAX_DISPLAY_MINS = 240;

/**
 * Standard alcohol elimination rate in units per hour
 * This is a general estimate - individual rates vary
 */
export const ELIMINATION_RATE_U_PER_HOUR = 1;

/**
 * Maximum quantity of drinks that can be added at once
 */
export const DRINK_MAX_QUANTITY = 10;

/**
 * Toast duration in milliseconds
 */
export const TOAST_DURATION_MS = 3000;
