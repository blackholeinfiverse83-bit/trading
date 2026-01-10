import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { PredictionItem } from '../types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  
  // Portfolio State
  portfolioValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
  
  // Predictions State
  predictions: PredictionItem[];
  userAddedTrades: PredictionItem[];
  hiddenTrades: string[];
  
  // Loading States
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setPortfolioMetrics: (metrics: {
    portfolioValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    totalGain: number;
    totalGainPercent: number;
  }) => void;
  setPredictions: (predictions: PredictionItem[]) => void;
  addUserTrade: (trade: PredictionItem) => void;
  removeUserTrade: (symbol: string) => void;
  hideTradeSymbol: (symbol: string) => void;
  unhideTradeSymbol: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    // Initial State
    sidebarOpen: false,
    commandPaletteOpen: false,
    portfolioValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    totalGain: 0,
    totalGainPercent: 0,
    predictions: [],
    userAddedTrades: [],
    hiddenTrades: [],
    isLoading: false,
    isRefreshing: false,
    
    // Actions
    setSidebarOpen: (open) => set((state) => {
      state.sidebarOpen = open;
    }),
    
    setCommandPaletteOpen: (open) => set((state) => {
      state.commandPaletteOpen = open;
    }),
    
    setPortfolioMetrics: (metrics) => set((state) => {
      state.portfolioValue = metrics.portfolioValue;
      state.dailyChange = metrics.dailyChange;
      state.dailyChangePercent = metrics.dailyChangePercent;
      state.totalGain = metrics.totalGain;
      state.totalGainPercent = metrics.totalGainPercent;
    }),
    
    setPredictions: (predictions) => set((state) => {
      state.predictions = predictions;
    }),
    
    addUserTrade: (trade) => set((state) => {
      state.userAddedTrades.push({ ...trade, isUserAdded: true });
    }),
    
    removeUserTrade: (symbol) => set((state) => {
      state.userAddedTrades = state.userAddedTrades.filter(t => t.symbol !== symbol);
    }),
    
    hideTradeSymbol: (symbol) => set((state) => {
      if (!state.hiddenTrades.includes(symbol)) {
        state.hiddenTrades.push(symbol);
      }
    }),
    
    unhideTradeSymbol: (symbol) => set((state) => {
      state.hiddenTrades = state.hiddenTrades.filter(s => s !== symbol);
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    setRefreshing: (refreshing) => set((state) => {
      state.isRefreshing = refreshing;
    }),
  }))
);