import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Play, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { stockAPI, authAPI } from '../services/api';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const EndpointTestPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    {
      name: 'Health Check',
      test: () => stockAPI.health(),
      endpoint: 'GET /tools/health'
    },
    {
      name: 'Connection Check',
      test: () => stockAPI.checkConnection(),
      endpoint: 'GET /'
    },
    {
      name: 'Predict (AAPL)',
      test: () => stockAPI.predict(['AAPL'], 'intraday'),
      endpoint: 'POST /tools/predict'
    },
    {
      name: 'Scan All',
      test: () => stockAPI.scanAll(['AAPL', 'GOOGL'], 'intraday', 0.5),
      endpoint: 'POST /tools/scan_all'
    },
    {
      name: 'Analyze (AAPL)',
      test: () => stockAPI.analyze('AAPL', ['intraday']),
      endpoint: 'POST /tools/analyze'
    },
    {
      name: 'Feedback',
      test: () => stockAPI.feedback('AAPL', 'LONG', 'Good prediction', 5.2),
      endpoint: 'POST /tools/feedback'
    },
    {
      name: 'Train RL (AAPL)',
      test: () => stockAPI.trainRL('AAPL', 'intraday', 5),
      endpoint: 'POST /tools/train_rl'
    },
    {
      name: 'Rate Limit Status',
      test: () => stockAPI.getRateLimitStatus(),
      endpoint: 'GET /auth/status'
    },
    {
      name: 'Auth Login',
      test: () => authAPI.login('test', 'test'),
      endpoint: 'POST /auth/login'
    }
  ];

  const runTest = async (endpoint: any, index: number) => {
    const startTime = Date.now();
    
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = {
        endpoint: endpoint.endpoint,
        status: 'pending',
        message: 'Testing...'
      };
      return newResults;
    });

    try {
      const result = await endpoint.test();
      const duration = Date.now() - startTime;
      
      setResults(prev => {
        const newResults = [...prev];
        newResults[index] = {
          endpoint: endpoint.endpoint,
          status: 'success',
          message: `Success: ${JSON.stringify(result).substring(0, 100)}...`,
          duration
        };
        return newResults;
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      setResults(prev => {
        const newResults = [...prev];
        newResults[index] = {
          endpoint: endpoint.endpoint,
          status: 'error',
          message: error.message || 'Unknown error',
          duration
        };
        return newResults;
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults(new Array(endpoints.length).fill(null));
    
    for (let i = 0; i < endpoints.length; i++) {
      await runTest(endpoints[i], i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Endpoint Testing
              </h1>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Test all backend API endpoints
              </p>
            </div>
          </div>
          
          <button
            onClick={runAllTests}
            disabled={testing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
          >
            <Play className="w-5 h-5" />
            {testing ? 'Testing...' : 'Run All Tests'}
          </button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => {
            const result = results[index];
            
            return (
              <div
                key={endpoint.endpoint}
                className={`${isLight 
                  ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
                  : isSpace 
                    ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
                    : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
                } rounded-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {result ? getStatusIcon(result.status) : <div className="w-5 h-5" />}
                    <div>
                      <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {endpoint.name}
                      </h3>
                      <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {endpoint.endpoint}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {result?.duration && (
                      <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {result.duration}ms
                      </span>
                    )}
                    <button
                      onClick={() => runTest(endpoint, index)}
                      disabled={testing}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-sm transition-all"
                    >
                      Test
                    </button>
                  </div>
                </div>
                
                {result && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-lg text-sm ${
                      result.status === 'success' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : result.status === 'error'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {result.message}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {results.length > 0 && (
          <div className={`${isLight 
            ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
            : isSpace 
              ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
              : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
          } rounded-lg p-6`}>
            <h3 className={`font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Test Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {results.filter(r => r?.status === 'success').length}
                </div>
                <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Passed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {results.filter(r => r?.status === 'error').length}
                </div>
                <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Failed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {results.filter(r => r?.status === 'pending').length}
                </div>
                <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Pending
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EndpointTestPage;