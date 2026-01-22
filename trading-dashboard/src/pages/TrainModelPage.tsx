import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Play, Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { stockAPI, aiAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const TrainModelPage = () => {
  const { showNotification } = useNotification();
  
  // Phase 6 - Train Model State
  const [trainSymbol, setTrainSymbol] = useState('AAPL');
  const [trainHorizon, setTrainHorizon] = useState<'intraday' | '1d' | '7d'>('intraday');
  const [episodes, setEpisodes] = useState(10);
  const [forceRetrain, setForceRetrain] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'complete' | 'error'>('idle');
  const [trainingMessage, setTrainingMessage] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Phase 7 - AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; message: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('intraday');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['RSI', 'MACD']);

  // Phase 6: Train RL Model
  const handleTrainModel = async () => {
    if (!trainSymbol.trim()) {
      showNotification('error', 'Invalid Input', 'Please enter a symbol');
      return;
    }

    setIsTraining(true);
    setTrainingStatus('training');
    setTrainingMessage('Initializing RL training...');
    setTrainingProgress(0);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setTrainingProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 1000);

      const response = await stockAPI.trainRL(
        trainSymbol.toUpperCase(),
        trainHorizon,
        episodes,
        forceRetrain
      );

      if (progressInterval) clearInterval(progressInterval);
      setTrainingProgress(100);
      setTrainingStatus('complete');
      setTrainingMessage(`Model trained successfully! Episodes: ${response.episodes_completed || episodes}`);

      showNotification(
        'success',
        'Training Complete',
        `${trainSymbol} model trained with ${response.episodes_completed || episodes} episodes`
      );

      // Reset form
      setTimeout(() => {
        setIsTraining(false);
        setTrainingStatus('idle');
        setTrainingProgress(0);
      }, 3000);
    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      setTrainingStatus('error');
      const msg = error.message || 'Failed to train model';
      setTrainingMessage(msg);

      showNotification('error', 'Training Failed', msg);
      setIsTraining(false);
    }
  };

  // Phase 7: AI Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Call backend AI chat endpoint
      const response = await (aiAPI as any).chat(userMessage, {
        symbol: selectedSymbol,
        timeframe: selectedTimeframe,
        active_indicators: activeIndicators
      });

      if (response?.message) {
        setChatMessages(prev => [...prev, { role: 'assistant', message: response.message }]);
        showNotification('success', 'AI Response', 'Assistant responded to your query');
      } else {
        throw new Error('No response from assistant. AI chat endpoint may not be available yet.');
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to get AI response';
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        message: `Note: ${msg}. For now, please refer to the predictions and analytics for trading insights.`
      }]);
      showNotification('error', 'AI Chat', msg);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Model Training & AI Assistant</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase 6: Train RL Model */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Train RL Model</h2>
            </div>

            <div className="space-y-4">
              {/* Symbol Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                <input
                  type="text"
                  value={trainSymbol}
                  onChange={(e) => setTrainSymbol(e.target.value.toUpperCase())}
                  disabled={isTraining}
                  placeholder="e.g., AAPL"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Horizon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Timeframe</label>
                <select
                  value={trainHorizon}
                  onChange={(e) => setTrainHorizon(e.target.value as any)}
                  disabled={isTraining}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="intraday">Intraday</option>
                  <option value="1d">1 Day</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>

              {/* Episodes Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Episodes ({episodes})</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={episodes}
                  onChange={(e) => setEpisodes(parseInt(e.target.value))}
                  disabled={isTraining}
                  className="w-full disabled:opacity-50"
                />
              </div>

              {/* Force Retrain Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="forceRetrain"
                  checked={forceRetrain}
                  onChange={(e) => setForceRetrain(e.target.checked)}
                  disabled={isTraining}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <label htmlFor="forceRetrain" className="text-sm text-gray-300">Force Retrain</label>
              </div>

              {/* Progress Bar */}
              {isTraining && (
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
              )}

              {/* Status Message */}
              {trainingMessage && (
                <div className={`flex items-start space-x-2 p-3 rounded ${
                  trainingStatus === 'complete' ? 'bg-green-900 border border-green-700' :
                  trainingStatus === 'error' ? 'bg-red-900 border border-red-700' :
                  'bg-blue-900 border border-blue-700'
                }`}>
                  {trainingStatus === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : trainingStatus === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={trainingStatus === 'complete' ? 'text-green-200' : trainingStatus === 'error' ? 'text-red-200' : 'text-blue-200'}>
                    {trainingMessage}
                  </p>
                </div>
              )}

              {/* Train Button */}
              <button
                onClick={handleTrainModel}
                disabled={isTraining}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isTraining ? 'Training...' : 'Start Training'}</span>
              </button>
            </div>
          </div>

          {/* Phase 7: AI Chat Assistant */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">AI Trading Assistant</h2>
            </div>

            <div className="space-y-4 h-full flex flex-col">
              {/* Context Settings */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Timeframe</label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option>intraday</option>
                    <option>1d</option>
                    <option>7d</option>
                  </select>
                </div>
              </div>

              {/* Indicators Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Active Indicators</label>
                <div className="flex flex-wrap gap-2">
                  {['RSI', 'MACD', 'BB', 'SMA'].map(indicator => (
                    <button
                      key={indicator}
                      onClick={() => setActiveIndicators(prev =>
                        prev.includes(indicator) ? prev.filter(i => i !== indicator) : [...prev, indicator]
                      )}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        activeIndicators.includes(indicator)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {indicator}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto bg-slate-700 rounded p-3 space-y-3 min-h-64">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No messages yet. Ask me something!</p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-600 text-gray-200'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-600 text-gray-200 px-3 py-2 rounded">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isChatLoading}
                  placeholder="Ask about trading..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <div className="flex space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-200 mb-1">Phase 6 & 7 Integration</h3>
              <p className="text-blue-300 text-sm">
                <strong>Phase 6 - Train RL Model:</strong> Train deep Q-learning agents for stock predictions with configurable episodes and timeframes.
              </p>
              <p className="text-blue-300 text-sm mt-1">
                <strong>Phase 7 - AI Assistant:</strong> Chat with an AI assistant that provides trading insights based on selected symbols, timeframes, and technical indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainModelPage;
