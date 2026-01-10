// Prediction Item Type Definition
export interface PredictionItem {
  symbol: string;
  action: 'LONG' | 'SHORT' | 'HOLD' | string;
  confidence: number;
  predicted_return: number;
  predicted_price?: number;
  current_price?: number;
  horizon?: string;
  reason?: string;
  risk_analysis?: {
    volatility?: number;
    max_drawdown?: number;
    sharpe_ratio?: number;
  };
  horizon_details?: Record<string, unknown>;
  has_overfitting_risk?: boolean;
  data_quality?: string;
  timestamp?: string;
  score?: number;
  error?: string;
  individual_predictions?: Record<string, unknown>;
  isUserAdded?: boolean;  // For tracking user-added trades
  // Optional properties for ensemble models
  ensemble_details?: Record<string, unknown>;
  risk_profile?: string;
  model_version?: string;
  warnings?: string[];
}

// Analyze Response Type Definition
export interface AnalyzeResponse {
  metadata: {
    symbol: string;
    horizons: string[];
    count: number;
    average_confidence: number;
    consensus: string;
    risk_parameters?: {
      stop_loss_pct?: number;
      capital_risk_pct?: number;
      drawdown_limit_pct?: number;
    };
    timestamp: string;
    request_id: string;
    error?: string;
  };
  predictions: PredictionItem[];
  analysis?: {
    symbol: string;
    horizons: Array<{
      horizon: string;
      action: string;
      confidence: number;
      predicted_return: number;
      predicted_price?: number;
      current_price?: number;
      reason?: string;
      technical_indicators?: {
        macd?: {
          signal: 'bullish' | 'bearish' | 'neutral';
          value?: number;
        };
        rsi?: {
          value: number;
          signal?: 'overbought' | 'oversold' | 'neutral';
        };
        moving_averages?: {
          trend: 'upward' | 'downward' | 'sideways';
          sma_20?: number;
          sma_50?: number;
        };
      };
    }>;
    risk_analysis?: {
      stop_loss_price?: number;
      stop_loss_pct?: number;
      position_size?: number;
      capital_risk_pct?: number;
      max_loss?: number;
    };
    summary?: string;
    warnings?: string[];
  };
}