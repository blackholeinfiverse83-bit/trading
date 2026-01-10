import { useState } from 'react';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';
import { CheckCircle, XCircle, Loader2, Play, Database, Brain, MessageSquare, Activity, BarChart3 } from 'lucide-react';

const ApiTestPage = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: 'health',
      label: 'Health Check',
      icon: Activity,
      description: 'Check system health and resources',
      test: () => stockAPI.health()
    },
    {
      name: 'predict',
      label: 'Predict',
      icon: Brain,
      description: 'Generate predictions for AAPL',
      test: () => stockAPI.predict(['AAPL'], 'intraday')
    },
    {
      name: 'analyze',
      label: 'Analyze',
      icon: BarChart3,
      description: 'Detailed analysis for AAPL',
      test: () => stockAPI.analyze('AAPL', ['intraday'])
    },
    {
      name: 'trainRL',
      label: 'Train RL',
      icon: Brain,
      description: 'Train RL model for AAPL',
      test: () => stockAPI.trainRL('AAPL', 'intraday', 10, false)
    },
    {
      name: 'fetchData',
      label: 'Fetch Data',
      icon: Database,
      description: 'Fetch historical data for AAPL',
      test: () => stockAPI.fetchData(['AAPL'], '1y', false, false)
    },
    {
      name: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'Submit feedback for AAPL prediction',
      test: () => stockAPI.feedback('AAPL', 'LONG', 'Test feedback - correct prediction', 5.5)
    }
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.name, test.test);
      // Small delay between tests to avoid overwhelming the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Play className="w-6 h-6" />
            API Test Suite
          </h1>
          <p className="text-gray-400 text-sm">Test all backend endpoints to ensure proper connectivity</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run All Tests
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => {
            const Icon = test.icon;
            const result = results[test.name];
            const isLoading = loading[test.name];
            
            return (
              <div key={test.name} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">{test.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {result && (
                      result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )
                    )}
                    <button
                      onClick={() => runTest(test.name, test.test)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors flex items-center gap-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Test
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">{test.description}</p>
                
                {result && (
                  <div className={`p-3 rounded-lg ${result.success ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
                    {result.success ? (
                      <div>
                        <p className="text-green-400 font-medium mb-2">✅ Success</p>
                        <pre className="text-xs text-green-300 bg-green-900/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2).slice(0, 300)}
                          {JSON.stringify(result.data, null, 2).length > 300 && '...'}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-400 font-medium mb-2">❌ Failed</p>
                        <p className="text-red-300 text-sm">{result.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Test Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {Object.values(results).filter(r => r?.success).length}
              </p>
              <p className="text-sm text-gray-400">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {Object.values(results).filter(r => r && !r.success).length}
              </p>
              <p className="text-sm text-gray-400">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">
                {tests.length - Object.keys(results).length}
              </p>
              <p className="text-sm text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApiTestPage;