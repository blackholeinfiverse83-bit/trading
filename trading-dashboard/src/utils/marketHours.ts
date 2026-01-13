/**
 * Utility functions for Indian market hours
 * Indian Market Hours: 9:15 AM to 3:30 PM (15:30) IST
 */

/**
 * Checks if the current time is within Indian market hours
 * @returns boolean - true if it's market hours, false otherwise
 */
export const isIndianMarketOpen = (): boolean => {
  // Get current time in IST (Indian Standard Time)
  const now = new Date();
  
  // Convert to IST by adding 5 hours 30 minutes to UTC
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (330 * 60000));
  
  const dayOfWeek = ist.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  
  // Check if it's a weekday (Monday to Friday)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  
  // Check if time is within market hours: 9:15 AM to 3:30 PM
  const isMarketStart = (hour === 9 && minute >= 15) || hour > 9; // From 9:15 AM onwards
  const isMarketEnd = (hour < 15) || (hour === 15 && minute <= 30); // Until 3:30 PM
  
  return isWeekday && isMarketStart && isMarketEnd;
};

/**
 * Gets the appropriate refresh interval based on market hours
 * @returns number - interval in milliseconds
 */
export const getRefreshInterval = (): number => {
  if (isIndianMarketOpen()) {
    // During market hours: 5-7 seconds for active trading
    return 5000; // 5 seconds
  } else {
    // Outside market hours: 30-60 seconds to reduce API calls
    return 30000; // 30 seconds
  }
};

/**
 * Gets a more aggressive refresh interval during market hours for premium users
 * @returns number - interval in milliseconds
 */
export const getPremiumRefreshInterval = (): number => {
  if (isIndianMarketOpen()) {
    // Premium users during market hours: 2-3 seconds for ultra-fast updates
    return 2000; // 2 seconds
  } else {
    // Even for premium users, reduce calls outside market hours
    return 30000; // 30 seconds
  }
};