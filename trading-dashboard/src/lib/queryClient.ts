import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys
export const queryKeys = {
  predictions: (symbols: string[], horizon: string) => ['predictions', symbols, horizon],
  health: () => ['health'],
  marketScan: (symbols: string[], horizon: string, minConfidence: number) => 
    ['marketScan', symbols, horizon, minConfidence],
  analyze: (symbol: string, horizons: string[]) => ['analyze', symbol, horizons],
} as const;