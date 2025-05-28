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