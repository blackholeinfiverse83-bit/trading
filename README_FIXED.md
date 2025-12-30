# ✅ FIXED - How to Start the Backend

## The Real Problem

The backend process was **stuck/hanging** with hundreds of connections. I've killed that process. Now you need to **start the backend fresh**.

## ✅ Simple Solution (Choose ONE method)

### Method 1: Simple Startup Script (RECOMMENDED)

**Double-click:** `START_BACKEND_FRESH.bat`

This will:
1. Kill any stuck processes
2. Start the backend server
3. Show you if it starts successfully

**Keep that window open!** The backend needs to run in that window.

### Method 2: Manual Start

Open a terminal/command prompt and run:

```bash
cd backend
python api_server.py
```

You should see:
```
Server starting on http://127.0.0.1:8000
```

**Keep this window open!** Don't close it - the backend runs here.

### Method 3: Using the Kill & Restart Script

**Double-click:** `KILL_AND_RESTART_BACKEND.bat`

This kills stuck processes and starts the server in the same window.

## ✅ Verify Backend is Running

After starting the backend, you should see in the backend window:
```
Server starting on http://127.0.0.1:8000
```

Then test it:
1. Open browser to: http://127.0.0.1:8000/docs
2. You should see the API documentation (Swagger UI)
3. Or run: `TEST_BACKEND_CONNECTION.bat`

## ⚠️ IMPORTANT

1. **Backend window must stay open** - Don't close it! The server runs in that window.
2. **Wait 10-15 seconds** after starting for the server to fully initialize
3. **If you see errors** in the backend window, read them - they tell you what's wrong

## ✅ Then Start Frontend

Once backend is running, start the frontend:

```bash
cd trading-dashboard
npm run dev
```

Or use: `START_ALL_SERVERS.bat` (it starts both)

## 🐛 Troubleshooting

### "Port 8000 is already in use"
- Run `KILL_AND_RESTART_BACKEND.bat` first
- Or manually: `taskkill /F /PID <process_id>`

### "Python not found"
- Install Python from python.org
- Make sure Python is in your PATH

### "Module not found" errors
- Run: `cd backend && pip install -r requirements.txt`

### Backend starts but frontend can't connect
- Wait 15-20 seconds for backend to fully start
- Check backend window for errors
- Verify backend is at http://127.0.0.1:8000/docs

## ✅ Summary

1. **Run:** `START_BACKEND_FRESH.bat`
2. **Keep that window open!**
3. **Wait 15 seconds**
4. **Check:** http://127.0.0.1:8000/docs (should show API docs)
5. **Start frontend** (in another terminal or use START_ALL_SERVERS.bat)

That's it! 🚀

