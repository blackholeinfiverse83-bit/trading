# Quick Start Guide

## 🚀 Easiest Way to Start Both Servers

### Option 1: Double-Click Batch File (Windows)
Simply double-click `START_SERVERS.bat` in the project root folder.

This will open two separate windows:
- **Backend Server** window - Shows backend logs
- **Frontend Server** window - Shows frontend logs

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd backend
python api_server.py
```

**Terminal 2 - Frontend:**
```powershell
cd trading-dashboard
npm run dev
```

## ✅ Verify It's Working

1. **Backend**: Open http://127.0.0.1:8000/docs - Should show API documentation
2. **Frontend**: Open http://localhost:5173 - Should show Trading Hub dashboard

## 🔧 Troubleshooting

### Backend Not Starting?
- Make sure Python is installed: `python --version`
- Install dependencies: `cd backend && pip install -r requirements.txt`
- Check if port 8000 is free: `netstat -ano | findstr :8000`

### Frontend Not Starting?
- Make sure Node.js is installed: `node --version`
- Install dependencies: `cd trading-dashboard && npm install`
- Check if port 5173 is free (Vite will use next available port)

### "Unable to connect to server" Error?
- Make sure backend is running first
- Wait 5-10 seconds after starting backend before using frontend
- Check backend window for any error messages
- Verify backend is accessible: Open http://127.0.0.1:8000 in browser

## 📝 Notes

- Backend takes 5-10 seconds to fully start
- First prediction for a new symbol may take 60-90 seconds (model training)
- Keep both terminal windows open while using the application

