import React, { useState } from 'react';
import { stockAPI } from '../services/api';

const TrainRL: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [horizon, setHorizon] = useState('intraday');
  const [episodes, setEpisodes] = useState(10);
  const [forceRetrain, setForceRetrain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    if (!symbol.trim()) {
      setError('Symbol is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await stockAPI.trainRL(symbol.trim().toUpperCase(), horizon, episodes, forceRetrain);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Training failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Train RL Model</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g., AAPL, RELIANCE.NS"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Horizon</label>
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="intraday">Intraday</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Episodes</label>
          <input
            type="number"
            value={episodes}
            onChange={(e) => setEpisodes(Number(e.target.value))}
            min="1"
            max="100"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="forceRetrain"
            checked={forceRetrain}
            onChange={(e) => setForceRetrain(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="forceRetrain" className="text-sm">Force Retrain</label>
        </div>

        <button
          onClick={handleTrain}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
        >
          {loading ? 'Training...' : 'Train Model'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainRL;