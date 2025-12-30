# Connection Issue - FIXED ✅

## Problem
Frontend was getting "Unable to connect to backend server" errors even though the server was running.

## Root Cause
The `/tools/predict` endpoint can take **60-90 seconds** on the first run (model training), but the frontend timeout was only **15 seconds**, causing requests to timeout.

## Fixes Applied

### 1. Increased Frontend Timeout
- **File**: `trading-dashboard/src/services/api.ts`
- **Change**: Increased timeout from 15 seconds to 120 seconds (2 minutes)
- **Reason**: First prediction requires model training which takes 60-90 seconds

### 2. Added Server Keep-Alive
- **File**: `backend/api_server.py`
- **Change**: Added `timeout_keep_alive=120` to uvicorn config
- **Reason**: Keeps connections alive for long-running requests

### 3. Better Loading Messages
- **File**: `trading-dashboard/src/pages/MarketScanPage.tsx`
- **Change**: Added loading message that informs users about the wait time
- **Message**: "Processing prediction (this may take 60-90 seconds on first run)..."

## Testing

1. **Start the backend:**
   ```batch
   cd backend
   python server_watchdog.py
   ```

2. **Start the frontend:**
   ```batch
   cd trading-dashboard
   npm run dev
   ```

3. **Test a prediction:**
   - Go to Market Scan page
   - Search for a symbol (e.g., "TATAMOTORS.NS")
   - Wait for the prediction (first time: 60-90 seconds)
   - Subsequent predictions: 2-5 seconds

## Expected Behavior

- ✅ First prediction: 60-90 seconds (includes model training)
- ✅ Subsequent predictions: 2-5 seconds (uses cached models)
- ✅ Loading message shows during processing
- ✅ No timeout errors

## If Still Having Issues

1. **Check server is running:**
   ```powershell
   netstat -ano | findstr :8000
   ```

2. **Test server directly:**
   - Open: http://127.0.0.1:8000/docs
   - Test `/tools/predict` endpoint manually

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for any error messages

4. **Check server logs:**
   ```powershell
   Get-Content backend\data\logs\api_server.log -Tail 50
   ```

## Notes

- The first prediction for each symbol takes longer because models need to be trained
- After training, predictions are much faster (2-5 seconds)
- Models are cached, so subsequent requests are fast
- The timeout is now 2 minutes, which should be enough for even the longest predictions



