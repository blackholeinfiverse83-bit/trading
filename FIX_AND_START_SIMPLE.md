# FIX AND START - Simple Solution

## The Problem

After 3-4 days of work, the main issue is:
- **Backend server is not running** (or stuck/hanging)
- Frontend is running but can't connect to backend
- Multiple attempts to fix have created confusion

## The Solution

I've created a simple script that fixes everything:

### Quick Start (Easiest Method)

**Just double-click:** `FIX_AND_START.bat`

This script will:
1. ✅ Check Python and Node.js are installed
2. ✅ Kill any stuck processes on port 8000
3. ✅ Start the backend server in a new window
4. ✅ Wait for backend to start
5. ✅ Start the frontend server in a new window
6. ✅ Verify everything is working

### What Happens

When you run `FIX_AND_START.bat`:

1. **Backend window opens** - Shows backend server logs
2. **Frontend window opens** - Shows frontend server logs
3. **Two URLs are displayed**:
   - Backend: http://127.0.0.1:8000/docs
   - Frontend: http://localhost:5173

### After Starting

1. **Open your browser** to: http://localhost:5173
2. **The dashboard should load** with data from the backend
3. **If you see errors**, check the backend window for error messages

### Common Issues

#### Backend Won't Start
- Check the backend window for error messages
- Make sure Python is installed: `python --version`
- Install dependencies: `cd backend && pip install -r requirements.txt`

#### Frontend Won't Start
- Check the frontend window for error messages
- Make sure Node.js is installed: `node --version`
- Install dependencies: `cd trading-dashboard && npm install`

#### No Data Showing
- Backend might still be initializing (wait 30-60 seconds)
- Check backend health: http://127.0.0.1:8000/tools/health
- Models need to be trained (first prediction takes 60-90 seconds)

### Manual Start (If Script Doesn't Work)

**Terminal 1 - Backend:**
```bash
cd backend
python api_server.py
```

**Terminal 2 - Frontend:**
```bash
cd trading-dashboard
npm run dev
```

### Stop Servers

- Close the backend and frontend windows
- Or press `Ctrl+C` in each window

### Verify Everything Works

Run the diagnostic script:
```bash
python diagnose_issue.py
```

This will check:
- ✅ Python and Node.js installed
- ✅ All files present
- ✅ Dependencies installed
- ✅ Backend running
- ✅ Frontend running
- ✅ Models available

---

## Status

✅ **All files are present**
✅ **All dependencies are installed**
✅ **Models are trained (55 model files found)**
❌ **Backend just needs to be started**

**The solution is simple: Just run `FIX_AND_START.bat` and everything should work!**

