# Frontend ↔ Backend Fetch Contract

**Last Updated:** 2024-12-30

## Base Configuration

```javascript
// Frontend config (trading-dashboard/src/config.ts)
const API_BASE_URL = 'http://127.0.0.1:8000';
const API_TIMEOUT = 120000; // 120 seconds (2 minutes)
```

## Authentication

**Status:** Optional (controlled by `ENABLE_AUTH` in backend config)

**If Auth Enabled:**
```javascript
// Login first
const loginResponse = await api.post('/auth/login', {
  username: 'admin',
  password: 'admin123'
});

// Store token
localStorage.setItem('token', loginResponse.data.token);

// Use in requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**If Auth Disabled:**
- No token required
- All endpoints accessible without authentication
- `get_current_user` returns anonymous user automatically

## Request Headers

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'  // Only if ENABLE_AUTH=true
}
```

## Error Handling Pattern

```javascript
try {
  const response = await api.post('/tools/fetch_data', {
    symbols: ['AAPL'],
    period: '2y',
    include_features: false,
    refresh: false
  });
  
  // Check for errors in response metadata
  if (response.data.metadata?.error) {
    throw new Error(response.data.metadata.error);
  }
  
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const detail = error.response.data?.detail || error.response.data?.error;
    
    if (status === 401) {
      // Authentication required
      console.error('Authentication failed');
    } else if (status === 429) {
      // Rate limit exceeded
      console.error('Rate limit exceeded');
    } else if (status === 503) {
      // Service unavailable
      console.error('Service temporarily unavailable');
    } else {
      console.error(`API Error ${status}:`, detail);
    }
  } else if (error.request) {
    // Request made but no response
    console.error('Network error: No response from server');
  } else {
    // Request setup error
    console.error('Request error:', error.message);
  }
  
  throw error;
}
```

## Endpoint Contracts

### 1. GET /tools/health

**Purpose:** Check server health and availability

**Request:**
```javascript
const response = await api.get('/tools/health');
```

**Response (200):**
```json
{
  "status": "healthy" | "degraded" | "error",
  "timestamp": "2024-12-30T12:00:00",
  "system": {
    "cpu_usage_percent": 15.2,
    "memory_percent": 45.3,
    "disk_percent": 60.1
  },
  "models": {
    "available": true,
    "total_trained": 12
  },
  "mcp_adapter": {
    "status": "ready" | "error" | "not_initialized",
    "error": "Error message if status=error"
  }
}
```

**Usage:**
```javascript
const checkConnection = async () => {
  try {
    const response = await api.get('/tools/health');
    return {
      connected: response.data.status !== 'error',
      status: response.data.status
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};
```

### 2. POST /tools/fetch_data

**Purpose:** Fetch historical stock data

**Request:**
```javascript
const response = await api.post('/tools/fetch_data', {
  symbols: ['AAPL', 'MSFT'],
  period: '2y',  // '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'
  include_features: false,
  refresh: false
});
```

**Response (200):**
```json
{
  "metadata": {
    "total_symbols": 2,
    "successful": 2,
    "cached": 1,
    "failed": 0,
    "period": "2y",
    "timestamp": "2024-12-30T12:00:00"
  },
  "results": [
    {
      "symbol": "AAPL",
      "status": "success" | "cached" | "error",
      "message": "Data fetched successfully",
      "rows": 504,
      "date_range": {
        "start": "2022-12-30",
        "end": "2024-12-30"
      },
      "latest_price": 195.50
    }
  ]
}
```

**Error Response (400/500/503):**
```json
{
  "detail": "Error message"
}
```

### 3. POST /tools/predict

**Purpose:** Get stock predictions

**Request:**
```javascript
const response = await api.post('/tools/predict', {
  symbols: ['AAPL'],
  horizon: 'intraday',  // 'intraday', 'short', 'long'
  risk_profile: 'moderate',  // Optional: 'low', 'moderate', 'high'
  stop_loss_pct: 2.0,  // Optional
  capital_risk_pct: 1.0,  // Optional
  drawdown_limit_pct: 5.0  // Optional
});
```

**Response (200):**
```json
{
  "metadata": {
    "count": 1,
    "horizon": "intraday",
    "risk_profile": "moderate",
    "timestamp": "2024-12-30T12:00:00"
  },
  "predictions": [
    {
      "symbol": "AAPL",
      "action": "LONG" | "SHORT" | "HOLD",
      "confidence": 0.85,
      "predicted_return": 2.5,
      "horizon_details": {
        "horizon": "intraday",
        "risk_profile": "moderate"
      }
    }
  ]
}
```

**Error Response:**
```json
{
  "metadata": {
    "count": 0,
    "error": "Error message",
    "timestamp": "2024-12-30T12:00:00"
  },
  "predictions": []
}
```

## Rate Limiting

**Limits:**
- 20 requests per minute
- 200 requests per hour

**Check Status:**
```javascript
const response = await api.get('/auth/status');
// Returns:
{
  "client_ip": "127.0.0.1",
  "requests_last_minute": 5,
  "requests_last_hour": 45,
  "limit_per_minute": 20,
  "limit_per_hour": 200,
  "remaining_minute": 15,
  "remaining_hour": 155
}
```

**Rate Limit Exceeded (429):**
```json
{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "Maximum 20 requests per minute allowed",
    "retry_after": 60
  }
}
```

## Timeout Handling

**Frontend Timeout:** 120 seconds (2 minutes)

**Why Long Timeout:**
- First-time predictions can take 60-90 seconds (model training)
- Data fetching can take 10-30 seconds for multiple symbols
- Feature calculation can take 5-10 seconds

**Implementation:**
```javascript
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,  // 2 minutes
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## Connection Check Pattern

```javascript
// Check connection before making requests
const checkConnection = async () => {
  try {
    const response = await api.get('/tools/health', {
      timeout: 5000  // Quick check, 5 seconds
    });
    return response.data.status !== 'error';
  } catch (error) {
    return false;
  }
};

// Use in components
useEffect(() => {
  const loadData = async () => {
    const connected = await checkConnection();
    if (!connected) {
      setError('Backend server is not reachable');
      return;
    }
    
    // Proceed with data loading
    await fetchData();
  };
  
  loadData();
}, []);
```

## Best Practices

1. **Always Check for Errors:**
   ```javascript
   if (response.data.metadata?.error) {
     throw new Error(response.data.metadata.error);
   }
   ```

2. **Handle Network Errors:**
   ```javascript
   catch (error) {
     if (error.code === 'ECONNABORTED') {
       // Timeout
     } else if (!error.response) {
       // Network error
     }
   }
   ```

3. **Use Health Check:**
   ```javascript
   // Before making requests, check health
   const health = await api.get('/tools/health');
   if (health.data.status === 'error') {
     // Server degraded, show warning
   }
   ```

4. **Respect Rate Limits:**
   ```javascript
   // Check rate limit status
   const status = await api.get('/auth/status');
   if (status.data.remaining_minute === 0) {
     // Wait before next request
   }
   ```

## Example: Complete Fetch Flow

```javascript
const fetchLiveData = async (symbols) => {
  try {
    // 1. Check connection
    const health = await api.get('/tools/health');
    if (health.data.status === 'error') {
      throw new Error('Server is unavailable');
    }
    
    // 2. Fetch data
    const dataResponse = await api.post('/tools/fetch_data', {
      symbols,
      period: '2y',
      include_features: false,
      refresh: false
    });
    
    // 3. Check for errors in response
    if (dataResponse.data.metadata?.error) {
      throw new Error(dataResponse.data.metadata.error);
    }
    
    // 4. Get predictions
    const predictResponse = await api.post('/tools/predict', {
      symbols,
      horizon: 'intraday'
    });
    
    // 5. Check for errors
    if (predictResponse.data.metadata?.error) {
      throw new Error(predictResponse.data.metadata.error);
    }
    
    return {
      data: dataResponse.data,
      predictions: predictResponse.data
    };
    
  } catch (error) {
    if (error.response?.status === 503) {
      // Service unavailable - retry later
      console.warn('Service temporarily unavailable, retrying...');
      setTimeout(() => fetchLiveData(symbols), 5000);
    } else {
      throw error;
    }
  }
};
```

---

## Summary

- **Base URL:** `http://127.0.0.1:8000`
- **Timeout:** 120 seconds
- **Auth:** Optional (Bearer token if enabled)
- **Rate Limits:** 20/min, 200/hour
- **Error Format:** Always check `metadata.error` in responses
- **Health Check:** Use `/tools/health` before critical operations



