import React, { useState } from 'react';
import { stockAPI } from '../services/api';

const TestAnalyzePage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing analyze endpoint...');
      const response = await stockAPI.analyze(
        'AAPL',
        ['intraday'],
        2.0,
        1.0,
        5.0
      );
      console.log('Response received:', response);
      setResult(response);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Test Analyze Endpoint</h1>
        
        <button
          onClick={testAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test AAPL Analysis'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded text-red-300">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded text-green-300">
            <h3 className="font-bold mb-2">Success! Response:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAnalyzePage;