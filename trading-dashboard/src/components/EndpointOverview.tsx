import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Zap, 
  Database, 
  TrendingUp, 
  Shield, 
  MessageCircle,
  Brain,
  BarChart3,
  Activity,
  Settings,
  Users
} from 'lucide-react';

const EndpointOverview = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  const endpoints = [
    {
      name: 'API Information',
      path: 'GET /',
      icon: Zap,
      category: 'Information',
      description: 'Get API information, available endpoints, version, and configuration',
      color: 'blue'
    },
    {
      name: 'Health Check',
      path: 'GET /tools/health',
      icon: Activity,
      category: 'Monitoring',
      description: 'Check system health, CPU usage, memory, disk space, and model availability',
      color: 'green'
    },
    {
      name: 'Rate Limit Status',
      path: 'GET /auth/status',
      icon: Shield,
      category: 'Security',
      description: 'Check your current rate limit status (requests remaining per minute/hour)',
      color: 'yellow'
    },
    {
      name: 'Predict',
      path: 'POST /tools/predict',
      icon: Brain,
      category: 'AI/ML',
      description: 'Get stock predictions with ensemble ML models and DQN trading agents',
      color: 'purple'
    },
    {
      name: 'Scan All',
      path: 'POST /tools/scan_all',
      icon: TrendingUp,
      category: 'Analysis',
      description: 'Scan multiple symbols and get them ranked by confidence',
      color: 'indigo'
    },
    {
      name: 'Analyze',
      path: 'POST /tools/analyze',
      icon: BarChart3,
      category: 'Analysis',
      description: 'Analyze a single symbol across multiple time horizons',
      color: 'cyan'
    },
    {
      name: 'Feedback',
      path: 'POST /tools/feedback',
      icon: MessageCircle,
      category: 'Learning',
      description: 'Submit feedback to improve the RL agent through reinforcement learning',
      color: 'pink'
    },
    {
      name: 'Train RL Agent',
      path: 'POST /tools/train_rl',
      icon: Brain,
      category: 'AI/ML',
      description: 'Train the DQN (Deep Q-Network) reinforcement learning agent',
      color: 'amber'
    },
    {
      name: 'Fetch Data',
      path: 'POST /tools/fetch_data',
      icon: Database,
      category: 'Data',
      description: 'Fetch historical data for symbols with intelligent caching',
      color: 'emerald'
    },
    {
      name: 'Risk Management',
      path: 'POST /api/risk/stop-loss',
      icon: Shield,
      category: 'Risk',
      description: 'Manage stop-loss orders and risk parameters',
      color: 'red'
    },
    {
      name: 'AI Chat',
      path: 'POST /api/ai/chat',
      icon: MessageCircle,
      category: 'AI',
      description: 'AI trading assistant for market insights',
      color: 'violet'
    }
  ];

  const categoryColors: Record<string, string> = {
    'Information': 'bg-blue-500/20 text-blue-400',
    'Monitoring': 'bg-green-500/20 text-green-400',
    'Security': 'bg-yellow-500/20 text-yellow-400',
    'AI/ML': 'bg-purple-500/20 text-purple-400',
    'Analysis': 'bg-indigo-500/20 text-indigo-400',
    'Learning': 'bg-pink-500/20 text-pink-400',
    'Data': 'bg-emerald-500/20 text-emerald-400',
    'Risk': 'bg-red-500/20 text-red-400',
    'AI': 'bg-violet-500/20 text-violet-400'
  };

  return (
    <div className={`${isLight 
      ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
      : isSpace 
        ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
        : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
    } rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 ${isLight ? 'bg-blue-100' : 'bg-blue-500/20'} rounded-lg`}>
          <Zap className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
        </div>
        <div>
          <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            API Endpoints Overview
          </h2>
          <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Explore all available endpoints in the trading platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {endpoints.map((endpoint, index) => {
          const Icon = endpoint.icon;
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                isLight
                  ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  : isSpace
                    ? 'bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50'
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isLight 
                    ? `bg-${endpoint.color}-100 text-${endpoint.color}-600` 
                    : `bg-${endpoint.color}-500/20 text-${endpoint.color}-400`
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {endpoint.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[endpoint.category]}`}>
                      {endpoint.category}
                    </span>
                  </div>
                  <p className={`text-xs font-mono mt-1 ${
                    isLight ? 'text-blue-600' : 'text-blue-400'
                  }`}>
                    {endpoint.path}
                  </p>
                  <p className={`text-xs mt-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {endpoint.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${
        isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'
      }`}>
        <h3 className={`font-semibold flex items-center gap-2 ${
          isLight ? 'text-blue-800' : 'text-blue-300'
        }`}>
          <Settings className="w-4 h-4" />
          Rate Limits
        </h3>
        <p className={`text-sm mt-2 ${isLight ? 'text-blue-700' : 'text-blue-200'}`}>
          All endpoints are subject to rate limiting: <strong>500 requests per minute</strong>,{' '}
          <strong>10,000 requests per hour</strong>. Monitor your usage on the Rate Limit Status endpoint.
        </p>
      </div>
    </div>
  );
};

export default EndpointOverview;