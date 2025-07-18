/**
 * Calculates alcohol units based on volume, ABV, and quantity
 * 
 * @param volumeMl - Volume in milliliters
 * @param abv - Alcohol by volume percentage
 * @param qty - Quantity consumed
 * @returns The number of alcohol units
 */
export function calculateUnits(
  volumeMl: number,
  abv: number,
  qty: number
): number {
  // Formula: Units = (volume_ml × abv × qty) / 1000
  return (volumeMl * abv * qty) / 1000;
}

/**
 * Gets date range for specified period
 * 
 * @param period - Time period (evening, day, week, month, year)
 * @returns Object with start and end dates
 */
export function getDateRange(period: 'evening' | 'day' | 'week' | 'month' | 'year'): { start: Date, end: Date } {
  const now = new Date();
  const start = new Date(now);
  
  switch (period) {
    case 'evening':
      // Consider evening as 6pm to midnight of current day
      start.setHours(18, 0, 0, 0);
      if (now.getHours() < 18) {
        // If current time is before 6pm, use previous day's evening
        start.setDate(start.getDate() - 1);
      }
      return { start, end: now };
      
    case 'day':
      // Start of current day
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
      
    case 'week':
      // Last 7 days
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
      
    case 'month':
      // Last 30 days
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
      
    case 'year':
      // Last 365 days
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
      
    default:
      return { start, end: now };
  }
}

/**
 * Standard alcohol elimination rate in units per hour
 */
const ELIMINATION_RATE_U_PER_HOUR = 1;

/**
 * Calculates remaining alcohol units based on elimination rate
 * 
 * @param units - Total alcohol units consumed
 * @param drankAt - Date when the drink was consumed
 * @returns Remaining alcohol units in the system
 */
export function remainingUnits(units: number, drankAt: Date): number {
  const elapsedHours = (Date.now() - drankAt.getTime()) / 3600000; // Convert milliseconds to hours
  return Math.max(0, units - elapsedHours * ELIMINATION_RATE_U_PER_HOUR);
}

/**
 * Calculates minutes until user is estimated to be sober enough to drive
 * 
 * @param consumptions - Array of consumption records with units and timestamp
 * @returns Minutes until safe to drive (0 if already safe)
 */
export function minsUntilSober(consumptions: { units: number; timestamp: string }[]): number {
  const totalRemainingUnits = consumptions.reduce(
    (sum, record) => sum + remainingUnits(record.units, new Date(record.timestamp)),
    0
  );
  
  // Convert remaining units to minutes (1 unit = 60 minutes to eliminate)
  return Math.ceil(totalRemainingUnits * 60);
}