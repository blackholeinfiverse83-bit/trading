// Currency conversion utility
const USD_TO_INR_RATE = 83.5; // Approximate rate, you can make this dynamic later

export const convertUSDToINR = (usdAmount: number): number => {
  return usdAmount * USD_TO_INR_RATE;
};

export const formatINR = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatUSD = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};