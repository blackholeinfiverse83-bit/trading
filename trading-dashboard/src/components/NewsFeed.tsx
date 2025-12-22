import { useState, useEffect } from 'react';
import { Newspaper, TrendingUp } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export function NewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Tech Stocks Rally on Strong Earnings Reports',
      summary: 'Major technology companies report better than expected quarterly earnings, driving market optimism.',
      source: 'Financial Times',
      timestamp: '2 hours ago',
      sentiment: 'positive'
    },
    {
      id: '2',
      title: 'Federal Reserve Holds Interest Rates Steady',
      summary: 'Central bank maintains current rates amid ongoing economic uncertainty and inflation concerns.',
      source: 'Wall Street Journal',
      timestamp: '4 hours ago',
      sentiment: 'neutral'
    },
    {
      id: '3',
      title: 'Oil Prices Drop Amid Supply Concerns',
      summary: 'Global oil markets react to geopolitical tensions affecting supply chains and production forecasts.',
      source: 'Reuters',
      timestamp: '6 hours ago',
      sentiment: 'negative'
    }
  ]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/50 bg-slate-800/30">
        <h2 className="text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-500" />
          Market News
        </h2>
        <p className="text-sm text-slate-400 mt-1">Latest financial headlines</p>
      </div>
      
      <div className="divide-y divide-slate-800/50">
        {newsItems.map((item) => (
          <div key={item.id} className="p-4 hover:bg-slate-800/20 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white text-sm font-medium leading-tight">{item.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.sentiment === 'positive' 
                  ? 'bg-green-500/20 text-green-400' 
                  : item.sentiment === 'negative' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-slate-700/50 text-slate-400'
              }`}>
                {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">{item.summary}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{item.source}</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 border-t border-slate-800/50 text-center">
        <button className="text-cyan-500 hover:text-cyan-400 text-sm font-medium">
          View All News
        </button>
      </div>
    </div>
  );
}