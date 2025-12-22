# Frontend Update Guide - Connecting to Real Backend

## 🎯 Purpose
This guide shows you **exactly where** to update the code once your backend team provides the API endpoints.

---

## 📋 What You Need From Backend Team

Before starting, get this information:

1. **Base API URL** - Example: `https://api.tradeai.com`
2. **Authentication Token** (if required) - Example: `Bearer abc123xyz`
3. **Confirmation** that all 3 endpoints are working

---

## 🔧 Changes Required (3 Files Only!)

### **Change 1: Trading Chart Data**

**File:** `/components/TradingChart.tsx`

**Find lines 36-90** (the generateMockData function inside useEffect)

**BEFORE (current mock code):**
```typescript
useEffect(() => {
  // Mock trading data - Replace with real API call
  const generateMockData = () => {
    const data: CandleData[] = [];
    let basePrice = 43000;
    
    for (let i = 30; i >= 0; i--) {
      // ... lots of mock data generation code ...
    }
    
    return data;
  };

  setChartData(generateMockData());
  
  // Update data every 10 seconds
  const interval = setInterval(() => {
    setChartData(generateMockData());
  }, 10000);
  
  return () => clearInterval(interval);
}, [timeframe, selectedAsset]);
```

**AFTER (real backend):**
```typescript
useEffect(() => {
  const fetchChartData = async () => {
    try {
      const response = await axios.get('https://api.tradeai.com/chart/data', {
        params: {
          symbol: selectedAsset,
          timeframe: timeframe,
          limit: 50
        },
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE',  // Remove if not needed
          'Content-Type': 'application/json'
        }
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  fetchChartData();
  
  // Update data every 10 seconds
  const interval = setInterval(fetchChartData, 10000);
  
  return () => clearInterval(interval);
}, [timeframe, selectedAsset]);
```

**⚠️ Replace:**
- `https://api.tradeai.com` with your actual API URL
- `YOUR_TOKEN_HERE` with your actual token (or remove Authorization line if not needed)

---

### **Change 2: Trade Confirmation**

**File:** `/components/InputPanel.tsx`

**Find lines 35-48** (the handleExecute function)

**BEFORE (current mock code):**
```typescript
const handleExecute = async () => {
  try {
    // In production, replace with: await axios.post('/tools/confirm', { parameters })
    const mockResponse: ConfirmationResponse = {
      success: true,
      message: 'Parameters confirmed successfully!',
      timestamp: new Date().toISOString(),
    };
    toast.success(mockResponse.message);
  } catch (error) {
    console.error('Error confirming parameters:', error);
    toast.error('Failed to confirm parameters');
  }
};
```

**AFTER (real backend):**
```typescript
const handleExecute = async () => {
  try {
    const response = await axios.post('https://api.tradeai.com/tools/confirm', {
      parameters
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',  // Remove if not needed
        'Content-Type': 'application/json'
      }
    });

    const mockResponse: ConfirmationResponse = {
      success: response.data.success,
      message: response.data.message,
      timestamp: response.data.timestamp || new Date().toISOString(),
    };

    toast.success(mockResponse.message);
  } catch (error) {
    console.error('Error confirming parameters:', error);
    toast.error('Failed to confirm parameters');
  }
};
```

**⚠️ Replace:**
- `https://api.tradeai.com` with your actual API URL
- `YOUR_TOKEN_HERE` with your actual token (or remove Authorization line if not needed)

---

### **Change 3: Chat Messages**

**File:** `/components/ChatPanel.tsx`

**Find lines 60-87** (the handleSend function)

**BEFORE (current mock code):**
```typescript
try {
  // In production, replace with actual API call:
  // const response = await axios.post('/chat/query', { message: input });
  // const assistantMessage = response.data.message;

  // Mock streaming response
  await new Promise(resolve => setTimeout(resolve, 1500));

  const responses = [
    'Based on the current market conditions, BTC is showing strong support at $43,000. The RSI indicates oversold conditions on the 4H timeframe.',
    'The AI model suggests a potential reversal pattern forming on ETH/USDT. Watch for confirmation on the next candle close.',
    'Risk management is crucial. Your current stop-loss of 2% is conservative and appropriate for volatile market conditions.',
    'Market sentiment analysis shows increased buying pressure across major crypto assets. Consider scaling into positions gradually.',
    'The S&P 500 is approaching a key resistance level. Monitor for breakout or rejection at this zone.',
  ];

  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date().toISOString(),
  };

  setMessages(prev => [...prev, assistantMessage]);
} catch (error) {
  console.error('Error sending message:', error);
} finally {
  setIsTyping(false);
}
```

**AFTER (real backend):**
```typescript
try {
  const response = await axios.post('https://api.tradeai.com/chat/query', {
    message: input
  }, {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',  // Remove if not needed
      'Content-Type': 'application/json'
    }
  });

  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: response.data.message,
    timestamp: response.data.timestamp || new Date().toISOString(),
  };

  setMessages(prev => [...prev, assistantMessage]);
} catch (error) {
  console.error('Error sending message:', error);
  toast.error('Failed to send message');
} finally {
  setIsTyping(false);
}
```

**⚠️ Replace:**
- `https://api.tradeai.com` with your actual API URL
- `YOUR_TOKEN_HERE` with your actual token (or remove Authorization line if not needed)

---

## 🧪 Testing After Changes

### Step 1: Test Trading Chart
1. Open the dashboard
2. Check if the chart displays price data
3. Try switching between assets (BTC/USDT, ETH/USDT, SPX)
4. Switch timeframes (15M, 1H, 4H, 1D)
5. Try different tabs (Price Action, Indicators, Volume)
6. Check browser console (F12) for any errors

### Step 2: Test Live Feed
1. Open the dashboard
2. Check if predictions appear in the "Live Predictions" panel
3. Wait 5 seconds - new predictions should appear
4. Check browser console (F12) for any errors

### Step 3: Test Trade Confirmation
1. Adjust the sliders (Stop Loss, Target Profit)
2. Enter an amount (e.g., 1000)
3. Click "Confirm Parameters" button
4. You should see a green success notification
5. Check browser console for any errors

### Step 4: Test Chat
1. Type a message in the chat box (e.g., "What's the BTC outlook?")
2. Press Enter or click Send
3. Wait for AI response
4. Check browser console for any errors

---

## 🐛 Troubleshooting

### Problem: "Network Error" in Console
**Solution:** Check if:
- Backend server is running
- API URL is correct
- CORS is enabled on backend

### Problem: "401 Unauthorized"
**Solution:** Check if:
- Authorization token is correct
- Token hasn't expired
- Token format is correct (`Bearer token`)

### Problem: Data not showing
**Solution:** Check if:
- Backend is returning correct JSON format
- Field names match (e.g., `entryPrice` vs `entry_price`)
- Open browser console (F12) and check Network tab

### Problem: CORS Error
**Solution:** Backend team needs to add:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📞 Getting Help

**Can't figure out the issue?**

1. Open browser console (Press F12)
2. Go to "Console" tab
3. Take a screenshot of any red errors
4. Go to "Network" tab
5. Click on the failed request
6. Take screenshots of "Headers" and "Response"
7. Send to your backend team

---

## ✅ Checklist

Before going live, confirm:

- [ ] All 3 API endpoints are working
- [ ] Base URL is updated in all 3 files
- [ ] Authorization token is added (if required)
- [ ] Tested Trading Chart - data displays correctly
- [ ] Tested Live Feed - predictions appear
- [ ] Tested Trade Confirmation - success toast appears
- [ ] Tested Chat - AI responds to messages
- [ ] No errors in browser console
- [ ] Mobile/iPad view works correctly

---

## 🚀 Quick Copy-Paste URLs

If your backend team gives you this URL: `https://api.tradeai.com`

**Use these exact endpoints:**
1. Live Feed: `https://api.tradeai.com/feed/live`
2. Confirm: `https://api.tradeai.com/tools/confirm`
3. Chat: `https://api.tradeai.com/chat/query`

---

## 📝 Notes

- Don't forget to **remove** the `Authorization` header lines if your backend doesn't use authentication
- Keep the mock data commented out (don't delete it) - useful for debugging
- If you need to switch back to mock data, just comment out the axios call and uncomment the mock data

---

**Need more help?** Share this document with your team or contact your backend developers! 😊