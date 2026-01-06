# 🚀 AUTO-START GUIDE - Backend + Frontend

## **Quick Start (Recommended)**

### **Option 1: Click to Start (Easiest)**
Simply **double-click** one of these files:

| File | What It Does |
|------|-------------|
| **`START_EVERYTHING.bat`** | Starts both Backend + Frontend in new windows (Batch) |
| **`START_EVERYTHING.ps1`** | Starts both Backend + Frontend with better logging (PowerShell) |

---

## **Step-by-Step: START_EVERYTHING.bat**

1. **Double-click** `START_EVERYTHING.bat` from the root directory
2. **Window 1** opens with Backend Server (Python)
3. **Window 2** opens with Frontend Dev Server (Node.js)
4. Both servers start automatically in ~6-7 seconds
5. Open your browser to: **http://localhost:5173**

### **What You'll See:**
```
Backend Window:
  ✓ MCP API SERVER STARTING
  ✓ Uvicorn running on http://127.0.0.1:8000
  ✓ All endpoints loaded

Frontend Window:
  ✓ VITE ready
  ✓ Local: http://localhost:5173
```

---

## **Step-by-Step: START_EVERYTHING.ps1 (Advanced)**

This requires PowerShell. Right-click and select "Run with PowerShell":

```powershell
# It will:
# [1/5] Check Python ✓
# [2/5] Check Node.js ✓
# [3/5] Clean old processes ✓
# [4/5] Start Backend (Port 8000)
# [5/5] Start Frontend (Port 5173+)

# Shows:
# ✅ Backend Health Check
# ✅ Process IDs
# ✅ URLs and docs links
```

---

## **Alternative: Command Line Startup**

### **Option A: Using npm (if concurrently is installed)**
```bash
npm install concurrently  # One-time setup
npm run start:all
```

### **Option B: Manual Terminal Startup**

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

---

## **Stop the Servers**

### **Option 1: Using Script**
**Double-click:** `KILL_ALL_SERVERS.ps1`
- Safely terminates all processes
- Clears ports
- Clean shutdown

### **Option 2: Manual**
- Close both terminal windows
- Or press `Ctrl+C` in each window

---

## **URLs & Access**

Once running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Trading Dashboard UI |
| **Backend API** | http://127.0.0.1:8000 | REST API server |
| **API Docs** | http://127.0.0.1:8000/docs | Swagger UI documentation |
| **API ReDoc** | http://127.0.0.1:8000/redoc | Alternative API docs |

---

## **Troubleshooting**

### **Problem: "Port 8000 is already in use"**
**Solution:** Run `KILL_ALL_SERVERS.ps1` to clear old processes, then start again

### **Problem: "Python not found"**
**Solution:** 
```bash
python --version
# If error, install Python from python.org
# Make sure to check "Add Python to PATH" during installation
```

### **Problem: "Node.js not found"**
**Solution:**
```bash
node --version
# If error, install Node.js from nodejs.org
```

### **Problem: "Command not found" in PowerShell**
**Solution:** Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run the startup script again

### **Problem: Frontend doesn't connect to Backend**
**Solution:**
1. Verify backend is running: http://127.0.0.1:8000
2. Check backend logs in the terminal
3. Restart both servers

---

## **Advanced: Custom Configuration**

### **Change Backend Port (from 8000)**
Edit `backend/config.py`:
```python
API_PORT = 8000  # Change this
```

### **Change Frontend Port (from 5173)**
Edit `trading-dashboard/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 5173,  // Change this
  }
})
```

---

## **File Structure**

```
Trading Dashboard/
├── START_EVERYTHING.bat          ← Double-click to start (Batch)
├── START_EVERYTHING.ps1          ← Double-click to start (PowerShell)
├── KILL_ALL_SERVERS.ps1          ← Stop all servers
├── KILL_ALL_SERVERS.bat          ← Stop all servers (Batch)
│
├── backend/                       ← Backend API Server
│   ├── api_server.py             ← Main server file
│   ├── config.py                 ← Configuration
│   └── ...
│
├── trading-dashboard/            ← Frontend App
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── package.json                  ← Root npm scripts
└── ...
```

---

## **npm Scripts Available**

Run these from the root directory:

```bash
npm run backend      # Start only backend
npm run frontend     # Start only frontend
npm run start:all    # Start both (requires concurrently)
npm run build        # Build frontend
npm run preview      # Preview production build
```

---

## **Quick Reference**

| Task | Command/File |
|------|-------------|
| Start Everything | Double-click `START_EVERYTHING.bat` |
| Stop Everything | Double-click `KILL_ALL_SERVERS.ps1` |
| Backend Only | `cd backend && python api_server.py` |
| Frontend Only | `cd trading-dashboard && npm run dev` |
| Check Backend | Visit http://127.0.0.1:8000/tools/health |
| Check Frontend | Visit http://localhost:5173 |

---

## **Next Steps**

1. **Start the servers** using `START_EVERYTHING.bat`
2. **Open frontend** at http://localhost:5173
3. **Add trades** in the Top Performers section
4. **Check predictions** from the backend API
5. **View portfolio metrics** in INR currency

---

## **Support**

- **Backend Issues:** Check `backend/server.log`
- **Frontend Issues:** Check browser console (F12)
- **API Status:** Visit http://127.0.0.1:8000/docs
- **Ports in use:** Run `KILL_ALL_SERVERS.ps1`

---

## **Summary**

✅ **Click `START_EVERYTHING.bat` to start everything**
✅ **Both backend and frontend start automatically**
✅ **Run `KILL_ALL_SERVERS.ps1` to stop everything**
✅ **Access dashboard at http://localhost:5173**

That's it! 🚀
