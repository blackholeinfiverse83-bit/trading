# Quick Fix - Backend Connection Issues

## Problem
Backend server keeps hanging or not responding to requests.

## Solution

### Step 1: Stop All Backend Processes
```powershell
# Find and kill all Python processes running the backend
Get-Process python | Where-Object { $_.Path -like "*python*" } | Stop-Process -Force
```

### Step 2: Start Backend with Watchdog
```batch
cd backend
python server_watchdog.py
```

The watchdog will automatically restart the server if it crashes.

### Step 3: Verify Backend is Working
Open in browser: http://127.0.0.1:8000/docs

You should see the Swagger API documentation.

### Step 4: Refresh Frontend
1. Go to http://localhost:5173
2. Press **Ctrl + Shift + R** (hard refresh)
3. The connection error should disappear

## Alternative: Use Startup Script

Simply run:
```batch
START_ALL_SERVERS.bat
```

This starts both backend and frontend with proper configuration.

## If Backend Keeps Hanging

The backend might be stuck initializing the MCP adapter. Check the backend window for error messages.

If you see errors about MCP adapter initialization, the server will still work - it just initializes the adapter on the first request (which takes 60-90 seconds).

## Current Status

- ✅ Backend should be running on port 8000
- ✅ Frontend should be running on port 5173
- ✅ Refresh browser to reconnect



