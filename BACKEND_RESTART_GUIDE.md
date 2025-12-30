# Backend Restart Guide

## Issue
Frontend cannot connect to backend at http://127.0.0.1:8000

## Quick Fix

### Option 1: Restart Backend (Recommended)
The backend server has been restarted. Wait 10-15 seconds for it to fully start, then:

1. **Refresh the frontend** (F5 or Ctrl+R)
2. **Check backend status**: http://127.0.0.1:8000/docs
3. **Try again** - the connection should work now

### Option 2: Manual Restart
If the backend didn't start automatically:

```powershell
cd "D:\blackhole projects\blackhole-infevers trade\Multi-Asset Trading Dashboard\backend"
python api_server.py
```

### Option 3: Use Startup Script
```batch
START_ALL_SERVERS.bat
```

## Verification Steps

1. **Check if backend is running**:
   - Open: http://127.0.0.1:8000/docs
   - Should show Swagger API documentation

2. **Check backend health**:
   - Open: http://127.0.0.1:8000/tools/health
   - Should return JSON with system status

3. **Check frontend connection**:
   - Open: http://localhost:5173
   - Should connect to backend after login

## Common Issues

### Port 8000 Already in Use
```powershell
# Find process using port 8000
netstat -ano | findstr ":8000"

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

### Backend Crashes Immediately
- Check backend window for error messages
- Verify Python dependencies: `pip install -r requirements.txt`
- Check .env file exists and is valid

### Backend Starts But Doesn't Respond
- Wait 10-15 seconds for full initialization
- Check backend logs in the console window
- Verify MCP Adapter initialized successfully

## Expected Backend Output

When backend starts successfully, you should see:
```
Server starting on http://127.0.0.1:8000
[INFO] EnhancedDataIngester initialized
[INFO] FeatureEngineer initialized
[INFO] MCP Adapter initialized successfully
INFO:     Started server process
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## After Backend Restarts

1. **Clear browser cache** (optional but recommended):
   - Press Ctrl+Shift+Delete
   - Clear cached images and files

2. **Refresh frontend**:
   - Press F5 or Ctrl+R
   - Frontend should reconnect automatically

3. **Login again**:
   - Use: `admin` / `admin123`
   - Get new JWT token
   - All API calls should work

## Status Check

✅ **Backend Running**: http://127.0.0.1:8000/docs shows API docs  
✅ **Frontend Running**: http://localhost:5173 loads  
✅ **Connection Working**: No more "Unable to connect" errors



