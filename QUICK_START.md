# ⚡ QUICK START - 3 Steps

## Step 1: Start Backend

**Double-click:** `START_BACKEND_FRESH.bat`

**Wait 15 seconds** - Look for "Server starting on http://127.0.0.1:8000"

**⚠️ IMPORTANT:** Keep that window open! Don't close it.

## Step 2: Verify Backend

Open browser: http://127.0.0.1:8000/docs

You should see the API documentation. If you see an error, check the backend window.

## Step 3: Start Frontend

Open a **new** terminal/command prompt:

```bash
cd trading-dashboard
npm run dev
```

Or use: `START_ALL_SERVERS.bat` (starts both)

---

## ✅ Done!

Open browser: http://localhost:5173

Your dashboard should work now!

---

## ❌ If Something Goes Wrong

1. **Backend not starting?**
   - Check the backend window for error messages
   - Make sure Python is installed: `python --version`
   - Install dependencies: `cd backend && pip install -r requirements.txt`

2. **Frontend can't connect?**
   - Make sure backend window is still open
   - Wait 20 seconds for backend to fully start
   - Check: http://127.0.0.1:8000/docs (should work)

3. **Port 8000 in use?**
   - Run: `KILL_AND_RESTART_BACKEND.bat`

---

**That's it! Simple as that!** 🎉

