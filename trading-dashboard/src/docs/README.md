# TradeAI Dashboard

A professional, minimal multi-asset trading dashboard with AI-powered predictions, execution console, and integrated chat assistant.

## Features

### 📈 Trading Analysis Chart
- Real-time price action with candlestick visualization
- Multiple timeframes (15M, 1H, 4H, 1D)
- Technical indicators (MA7, MA25, RSI, MACD, Bollinger Bands)
- Volume analysis with detailed metrics
- Multi-asset switching (BTC/USDT, ETH/USDT, SPX)
- Interactive tooltips with OHLC data
- Three chart views: Price Action, Indicators, Volume

### 📊 Live Predictions Feed
- Real-time AI trading signals with confidence scores
- Multi-asset support (Crypto, Stocks, Forex)
- Visual indicators for long/short positions
- Automatic updates every 5 seconds
- API endpoint: `GET /feed/live`

### ⚡ Execution Console
- Live AI decision log
- Trade execution confirmations
- Real-time P&L tracking
- Event categorization (Entry, Exit, Analysis, Alert)
- Color-coded status indicators

### 🎛️ Input Panel
- **Stop Loss %**: Adjustable slider (0.5% - 10%)
- **Target Profit %**: Adjustable slider (1% - 20%)
- **Trade Amount**: USD input field
- **Risk Toggle**: Enable/disable aggressive risk mode
- Real-time risk/reward calculation
- API endpoint: `POST /tools/confirm`

### 💬 Uniguru Chat
- Embedded streaming AI assistant
- Market analysis and insights
- Trading strategy recommendations
- Real-time conversation interface
- API endpoint: `POST /chat/query`

## Tech Stack

- **React** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** (motion/react) - Animations
- **Axios** - API calls
- **Shadcn/ui** - Component library
- **Lucide React** - Icons

## Component Architecture

```
/App.tsx                          # Main layout & dashboard grid
/components/
  ├── TradingChart.tsx           # Technical analysis charts
  ├── LivePredictionsFeed.tsx    # Real-time predictions
  ├── ExecutionConsole.tsx       # AI decision log
  ├── InputPanel.tsx             # Trade parameter controls
  └── ChatPanel.tsx              # Uniguru chat interface
```

## API Integration

### 1. Trading Chart Data (`GET /chart/data`)
```typescript
interface CandleData {
  time: string;          // ISO 8601 or HH:MM format
  open: number;          // Opening price
  high: number;          // Highest price
  low: number;           // Lowest price
  close: number;         // Closing price
  volume: number;        // Trading volume
  ma7?: number;          // Optional: 7-period MA
  ma25?: number;         // Optional: 25-period MA
}
```

### 2. Live Feed (`GET /feed/live`)
```typescript
interface Prediction {
  id: string;
  asset: string;
  symbol: string;
  direction: 'long' | 'short';
  confidence: number;
  entryPrice: number;
  timestamp: string;
  timeframe: string;
}
```

### 3. Confirm Trade (`POST /tools/confirm`)
```typescript
interface TradeParams {
  stopLoss: number;      // Percentage (0.5 - 10)
  targetProfit: number;  // Percentage (1 - 20)
  amount: number;        // USD amount
  riskMode: boolean;     // Aggressive mode toggle
}
```

### 4. Chat Query (`POST /chat/query`)
```typescript
interface ChatRequest {
  message: string;
}

interface ChatResponse {
  message: string;
  timestamp: string;
}
```

## Responsive Design

- **Desktop**: Full 3-column layout (Predictions + Console + Chat)
- **iPad**: Responsive grid that adapts to tablet screen sizes
- **Mobile**: Single column stacked layout (auto-responsive)

## Setup & Installation

1. Install dependencies (automatically handled by the platform)
2. Replace mock API calls with your actual endpoints:
   - In `LivePredictionsFeed.tsx`: Replace mock fetch with `axios.get('/feed/live')`
   - In `InputPanel.tsx`: Replace mock submit with `axios.post('/tools/confirm', data)`
   - In `ChatPanel.tsx`: Replace mock response with `axios.post('/chat/query', { message })`

## Color Scheme

- **Background**: Dark slate gradient (950/900)
- **Cards**: Slate-900/50 with backdrop blur
- **Borders**: Slate-800/50
- **Accents**: 
  - Primary: Blue-600
  - Secondary: Purple-600
  - Success: Green-500
  - Danger: Red-500
  - Warning: Yellow-500

## Key Features

✅ Real-time data streaming  
✅ Smooth animations with Framer Motion  
✅ Professional dark theme  
✅ Responsive grid layout  
✅ Risk/reward calculator  
✅ Interactive sliders and controls  
✅ Toast notifications  
✅ AI chat integration  
✅ Type-safe TypeScript  
✅ Modular component architecture  

## Mock Data

Currently, the dashboard uses mock data for demonstration. To connect to real APIs:

1. Update the axios calls in each component
2. Ensure your backend endpoints match the expected request/response formats
3. Add authentication headers if required
4. Handle error states appropriately

## Environment Variables

If needed, create a `.env` file:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_KEY=your_api_key_here
```

Then use in components:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

## Performance

- Optimized re-renders with React hooks
- Debounced API calls
- Efficient list rendering with keys
- Lazy loading for heavy components
- Virtualized scrolling for long lists

## Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] Advanced charting with TradingView
- [ ] Position management dashboard
- [ ] Portfolio analytics
- [ ] Multi-user support
- [ ] Dark/Light theme toggle
- [ ] Export trade history
- [ ] Custom alert system

## License

MIT License - feel free to use this in your projects!

---

Built with ❤️ using React, Tailwind CSS, and Framer Motion