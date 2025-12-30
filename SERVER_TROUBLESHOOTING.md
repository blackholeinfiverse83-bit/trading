# Server Troubleshooting Guide

## Problem: Server Stops Automatically

If your server keeps stopping/crashing, here's how to fix it:

### Solution 1: Use the Watchdog (Recommended)

The watchdog automatically restarts the server if it crashes:

```batch
cd backend
python server_watchdog.py
```

Or use the batch file:
```batch
backend\START_SERVER.bat
```

### Solution 2: Check What's Causing the Crash

1. **Check the logs:**
   ```powershell
   Get-Content backend\data\logs\api_server.log -Tail 50
   ```

2. **Run diagnostics:**
   ```powershell
   cd backend
   python diagnose_server.py
   ```

3. **Common issues:**
   - Port 8000 already in use → Kill the process or change port
   - Missing dependencies → Run `pip install -r requirements.txt`
   - MCP Adapter initialization fails → Server will still start, adapter initializes on first request

### Solution 3: Start Server Manually (For Debugging)

```batch
cd backend
python api_server.py
```

Watch the console output for error messages.

---

## Problem: Cannot Connect to Backend

### Check 1: Is the server running?

```powershell
netstat -ano | findstr :8000
```

If nothing shows, the server is not running.

### Check 2: Test the server directly

Open in browser: http://127.0.0.1:8000/docs

Or test with PowerShell:
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/tools/health" -UseBasicParsing
```

### Check 3: Port conflicts

If port 8000 is in use:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>
```

Or change the port in `backend/.env`:
```
UVICORN_PORT=8001
```

### Check 4: Firewall/Antivirus

- Check if Windows Firewall is blocking port 8000
- Check if antivirus is blocking Python

---

## Quick Fixes

### Fix 1: Restart Everything

1. Stop all running servers (close all terminal windows)
2. Kill any processes on port 8000:
   ```powershell
   netstat -ano | findstr :8000
   taskkill /F /PID <PID>
   ```
3. Start fresh:
   ```batch
   START_ALL_SERVERS.bat
   ```

### Fix 2: Use Watchdog for Auto-Restart

```batch
cd backend
python server_watchdog.py
```

This will automatically restart the server if it crashes.

### Fix 3: Check Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### Fix 4: Clear and Recreate Directories

```powershell
cd backend
# Backup important data first!
Remove-Item -Recurse -Force data\logs\* -ErrorAction SilentlyContinue
python api_server.py
```

---

## Server Status Endpoints

Once the server is running, check these:

- **API Info:** http://127.0.0.1:8000/
- **Health Check:** http://127.0.0.1:8000/tools/health
- **API Docs:** http://127.0.0.1:8000/docs

---

## What Was Fixed

1. **Lazy MCP Adapter Initialization** - Server starts even if adapter fails
2. **Better Error Handling** - Errors don't crash the server
3. **Watchdog Script** - Auto-restarts server if it crashes
4. **Startup Event Fix** - Startup errors don't prevent server from starting

---

## Still Having Issues?

1. Run diagnostics: `python backend\diagnose_server.py`
2. Check logs: `backend\data\logs\api_server.log`
3. Share the error message for help



