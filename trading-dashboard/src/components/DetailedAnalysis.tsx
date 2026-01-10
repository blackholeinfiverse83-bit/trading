import React from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, Target, AlertTriangle, BarChart3 } from 'lucide-react';
import { AnalyzeResponse, PredictionItem } from '../types';
import { convertUSDToINR, formatINR } from '../utils/currency';

interface DetailedAnalysisProps {
  data: AnalyzeResponse;
  isLight?: boolean;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ data, isLight = false }) => {
  if (!data || !data.predictions || data.predictions.length === 0) {
    return null;
  }

  const { predictions, metadata } = data;
  const symbol = metadata.symbol;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Detailed Analysis for {symbol}
        </h3>
        <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          Updated: {new Date(metadata.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Consensus Summary */}
      {metadata.consensus && (
        <div className={`${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-500/30'} rounded-lg p-4`}>
          <h4 className={`text-base font-semibold ${isLight ? 'text-blue-900' : 'text-blue-300'} mb-2 flex items-center gap-2`}>
            <Activity className="w-4 h-4" />
            Market Consensus
          </h4>
          <p className={`text-sm ${isLight ? 'text-blue-800' : 'text-blue-200'} leading-relaxed`}>
            {metadata.consensus}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className={`${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
              Average Confidence: {(metadata.average_confidence * 100).toFixed(1)}%
            </span>
            <span className={`${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
              Horizons Analyzed: {metadata.horizons.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Horizon Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((prediction: PredictionItem, index: number) => {
          const isPositive = (prediction.predicted_return || 0) > 0;
          const confidence = (prediction.confidence || 0) * 100;
          
          return (
            <div
              key={index}
              className={`${isLight 
                ? 'bg-white border border-gray-200' 
                : 'bg-slate-800/80 border border-slate-700/50'
              } rounded-lg p-4 shadow-sm`}
            >
              {/* Horizon Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'} capitalize`}>
                    {prediction.horizon === 'intraday' ? 'Same Day / Next Day' : 
                     prediction.horizon === 'short' ? 'Next Day' : 
                     prediction.horizon === 'long' ? '5-30 Days' : prediction.horizon}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  prediction.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                  prediction.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {prediction.action === 'LONG' ? 'BUY' : prediction.action === 'SHORT' ? 'SELL' : 'HOLD'}
                </span>
              </div>

              {/* Price Information */}
              <div className="space-y-2 mb-3">
                {prediction.current_price && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Current:</span>
                    <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {formatINR(convertUSDToINR(prediction.current_price))}
                    </span>
                  </div>
                )}
                {prediction.predicted_price && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Target:</span>
                    <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {formatINR(convertUSDToINR(prediction.predicted_price))}
                    </span>
                  </div>
                )}
                {prediction.predicted_return !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Return:</span>
                    <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{prediction.predicted_return.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Confidence */}
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Confidence:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    confidence > 70 ? 'bg-green-400' :
                    confidence > 50 ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className={`font-semibold ${
                    confidence > 70 ? 'text-green-400' :
                    confidence > 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {confidence.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Pattern Analysis */}
              {prediction.reason && (
                <div className={`mt-3 pt-3 border-t ${isLight ? 'border-gray-200' : 'border-slate-600/50'}`}>
                  <h5 className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'} mb-1`}>
                    Price Pattern Analysis
                  </h5>
                  <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-300'} leading-relaxed`}>
                    {prediction.reason.includes('MACD') ? 
                      `Price pattern suggests ${prediction.action?.toLowerCase()} opportunity with MACD showing momentum` :
                      prediction.reason
                    }
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Risk Analysis */}
      {metadata.risk_parameters && (
        <div className={`${isLight ? 'bg-white border border-gray-200' : 'bg-slate-800/80 border border-slate-700/50'} rounded-lg p-4`}>
          <h4 className={`text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
            <Target className="w-4 h-4 text-orange-400" />
            Risk Management
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metadata.risk_parameters.stop_loss_pct && (
              <div className="text-center">
                <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-1`}>Stop Loss</div>
                <div className={`text-lg font-bold text-red-400`}>
                  {metadata.risk_parameters.stop_loss_pct.toFixed(1)}%
                </div>
                <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Risk limit
                </div>
              </div>
            )}
            {metadata.risk_parameters.capital_risk_pct && (
              <div className="text-center">
                <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-1`}>Capital Risk</div>
                <div className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {metadata.risk_parameters.capital_risk_pct.toFixed(1)}%
                </div>
                <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Per trade
                </div>
              </div>
            )}
            {metadata.risk_parameters.drawdown_limit_pct && (
              <div className="text-center">
                <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-1`}>Max Drawdown</div>
                <div className={`text-lg font-bold text-red-400`}>
                  {metadata.risk_parameters.drawdown_limit_pct.toFixed(1)}%
                </div>
                <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Portfolio limit
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedAnalysis;