import type { Holding } from '../types';

/**
 * Calculates the total portfolio value from holdings
 * @param holdings - Array of portfolio holdings
 * @returns Total portfolio value
 */
export const calculatePortfolioValue = (holdings: Holding[]): number => {
  return holdings.reduce((sum, holding) => sum + holding.value, 0);
};

/**
 * Calculates the total portfolio gain from holdings
 * @param holdings - Array of portfolio holdings
 * @returns Total portfolio gain
 */
export const calculatePortfolioGain = (holdings: Holding[]): number => {
  return holdings.reduce((sum, holding) => sum + (holding.currentPrice - holding.avgPrice) * holding.shares, 0);
};

/**
 * Calculates the total portfolio gain percentage from holdings
 * @param holdings - Array of portfolio holdings
 * @returns Total portfolio gain percentage
 */
export const calculatePortfolioGainPercent = (holdings: Holding[]): number => {
  const totalValue = calculatePortfolioValue(holdings);
  const totalGain = calculatePortfolioGain(holdings);
  return totalValue > 0 ? (totalGain / totalValue) * 100 : 0;
};

/**
 * Gets portfolio holdings from localStorage
 * @returns Array of portfolio holdings
 */
export const getPortfolioHoldings = (): Holding[] => {
  const savedHoldings = localStorage.getItem('portfolio_holdings');
  let holdings: Holding[] = savedHoldings ? JSON.parse(savedHoldings) : [];

  // Filter out any fake data that may have been previously stored
  holdings = holdings.filter(holding => {
    // Remove fake data with placeholder prices (typically 100.0) and fake symbols
    // But preserve legitimate RELIANCE.NS stock which is a real Indian stock
    return !(holding.currentPrice === 100.0 && holding.symbol === 'RE') &&
           !(holding.currentPrice === 100.0 && holding.symbol === 'REL') &&
           !(holding.currentPrice === 100.0 && holding.symbol === 'RELIANCE' && !holding.symbol.endsWith('.NS')) &&
           !holding.symbol.startsWith('FAKE') &&
           !holding.symbol.includes('TEST');
  });

  return holdings;
};

/**
 * Gets total portfolio value from localStorage holdings
 * @returns Total portfolio value
 */
export const getTotalPortfolioValue = (): number => {
  const holdings = getPortfolioHoldings();
  return calculatePortfolioValue(holdings);
};

/**
 * Gets total portfolio gain from localStorage holdings
 * @returns Total portfolio gain
 */
export const getTotalPortfolioGain = (): number => {
  const holdings = getPortfolioHoldings();
  return calculatePortfolioGain(holdings);
};

/**
 * Gets total portfolio gain percentage from localStorage holdings
 * @returns Total portfolio gain percentage
 */
export const getTotalPortfolioGainPercent = (): number => {
  const holdings = getPortfolioHoldings();
  return calculatePortfolioGainPercent(holdings);
};