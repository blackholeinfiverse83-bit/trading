# Backend Connection Troubleshooting

## 🔴 Error: "Unable to connect to server. Please check if the backend is running."

### Quick Fix Steps:

1. **Check if Backend is Running:**
   - Look for a window titled "Backend Server" 
   - Check if it shows "Server starting on http://127.0.0.1:8000"
   - If no window exists, backend is not running

2. **Restart Backend (Easiest Method):**
   - **Option A**: Double-click `RESTART_BACKEND.bat` in the project root
   - **Option B**: Run these commands in a terminal:
     ```powershell
     cd backend
     python api_server.py
     ```

3. **Wait for Backend to Start:**
   - Backend takes 5-10 seconds to fully initialize
   - Look for message: "Server starting on http://127.0.0.1:8000"
   - Wait until you see "Application startup complete"

4. **Verify Backend is Working:**
   - Open browser: http://127.0.0.1:8000/docs
   - Should show Swagger API documentation
   - If this works, backend is running correctly

5. **Refresh Frontend:**
   - Go back to your frontend (http://localhost:5173)
   - The error should disappear once backend is running

### Common Issues:

**Issue**: Port 8000 already in use
- **Solution**: Kill the process using port 8000:
  ```powershell
  netstat -ano | findstr :8000
  taskkill /F /PID <PID_NUMBER>
  ```

**Issue**: Backend crashes immediately
- **Solution**: Check backend window for error messages
- Common causes: Missing Python packages, missing data files
- Install dependencies: `cd backend && pip install -r requirements.txt`

**Issue**: Backend starts but doesn't respond
- **Solution**: Restart backend using `RESTART_BACKEND.bat`
- Check backend logs in `backend/data/logs/`

### Manual Start Commands:

**Terminal 1 - Backend:**
```powershell
cd "D:\blackhole projects\blackhole-infevers trade\Multi-Asset Trading Dashboard\backend"
python api_server.py
```

**Terminal 2 - Frontend (if not already running):**
```powershell
cd "D:\blackhole projects\blackhole-infevers trade\Multi-Asset Trading Dashboard\trading-dashboard"
npm run dev
```

### Expected Backend Output:

When backend starts successfully, you should see:
```
========================================
            API SERVER STARTING
========================================

ENDPOINTS:
  GET  /              - API information
  GET  /auth/status   - Rate limit status
  GET  /tools/health  - System health
  POST /tools/predict - Generate predictions
  ...

Server starting on http://127.0.0.1:8000
========================================
```

### Still Having Issues?

1. Check Python version: `python --version` (should be 3.8+)
2. Check Node.js version: `node --version` (should be 16+)
3. Verify dependencies are installed
4. Check firewall isn't blocking port 8000
5. Try restarting your computer if ports are stuck

