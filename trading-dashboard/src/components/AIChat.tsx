import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { aiAPI } from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  context?: {
    symbol?: string;
    timeframe?: string;
    activeIndicators?: string[];
  };
}

const AIChat = ({ context }: AIChatProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze markets, explain predictions, and answer trading questions. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.chat(userMessage.content, context);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: error.message.includes('not yet implemented') 
          ? 'AI Chat feature is coming soon! This will provide intelligent trading insights and market analysis.'
          : `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${isLight 
      ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
      : isSpace 
        ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
        : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
    } rounded-lg flex flex-col h-96`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200/20">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Bot className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            AI Trading Assistant
          </h3>
          <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {context?.symbol ? `Analyzing ${context.symbol}` : 'Ready to help'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : isLight
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-slate-700 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 opacity-70`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="p-2 bg-gray-500/20 rounded-lg flex-shrink-0">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-700'}`}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about market trends, predictions, or trading strategies..."
            className={`flex-1 px-4 py-2 rounded-lg border ${isLight
              ? 'bg-gray-50 border-gray-300 text-gray-900'
              : 'bg-slate-700 border-slate-600 text-white'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;