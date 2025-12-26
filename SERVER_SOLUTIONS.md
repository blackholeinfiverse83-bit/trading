# 🔧 Server Solutions - Auto-Restart & Monitoring

## Problem Solved
Your backend server was stopping suddenly, causing frontend errors. Now you have multiple solutions with auto-restart capabilities.

---

## 🚀 Solution 1: KEEP_RUNNING.bat (RECOMMENDED)

**Best for:** Easy server management with menu

**How to use:**
1. Double-click `KEEP_RUNNING.bat`
2. Choose option 1 to start both servers
3. The backend will automatically restart if it crashes!

**Features:**
- Menu-driven interface
- Auto-restart backend on crash
- Check server status
- Stop all servers easily
- Start servers individually

---

## 🚀 Solution 2: START_SERVERS_ROBUST.bat

**Best for:** One-click start with auto-restart

**How to use:**
- Double-click `START_SERVERS_ROBUST.bat`
- Backend automatically restarts if it crashes

**Features:**
- Automatically checks if Python/Node.js are installed
- Opens separate windows for each server
- Backend has auto-restart watchdog

---

## 🚀 Solution 3: START_BACKEND_WATCHDOG.bat

**Best for:** Just starting backend with auto-restart

**How to use:**
- Double-click `START_BACKEND_WATCHDOG.bat`
- Only starts backend (you need to start frontend separately)

**Features:**
- Auto-restarts backend if it crashes
- Shows crash messages
- Waits 5 seconds between restarts

---

## 🐍 Solution 4: Python Watchdog (Most Robust)

**Best for:** Production use or when you need advanced monitoring

**How to use:**
```powershell
cd backend
python server_watchdog.py
```

**Features:**
- Python-based watchdog (more reliable than batch)
- Tracks restart count
- Better error handling
- Can limit restart attempts

---

## 📋 Comparison

| Solution | Auto-Restart | Easy to Use | Best For |
|----------|-------------|-------------|----------|
| KEEP_RUNNING.bat | ✅ Yes | ⭐⭐⭐⭐⭐ | Daily use |
| START_SERVERS_ROBUST.bat | ✅ Yes | ⭐⭐⭐⭐ | Quick start |
| START_BACKEND_WATCHDOG.bat | ✅ Yes | ⭐⭐⭐ | Backend only |
| server_watchdog.py | ✅ Yes | ⭐⭐ | Advanced users |

---

## 🎯 Recommended Workflow

1. **First time setup:** Use `KEEP_RUNNING.bat` (menu option 1)
2. **Daily use:** Double-click `START_SERVERS_ROBUST.bat`
3. **If server crashes:** It will automatically restart!

---

## ⚙️ How Auto-Restart Works

When the backend crashes:
1. The watchdog detects the crash
2. Waits 5 seconds
3. Automatically restarts the server
4. Logs the restart attempt
5. Continues running normally

---

## 🛑 How to Stop Servers

### Using KEEP_RUNNING.bat:
- Choose option 5 (Stop All Servers)

### Manual:
```powershell
taskkill /F /IM python.exe /T
taskkill /F /IM node.exe /T
```

### Or just:
- Close the server windows

---

## 🔍 Check Server Status

Use `KEEP_RUNNING.bat` menu option 4 to check:
- Is backend running on port 8000?
- Is frontend running on port 5173?

---

## 💡 Tips

1. **Keep server windows open** - You can see logs and errors
2. **Check logs** - If crashes persist, check the error messages
3. **First prediction** - May take 60-90 seconds (normal for model training)
4. **Port conflicts** - If port 8000 is busy, the watchdog will keep trying

---

## 🐛 Troubleshooting

### Server keeps crashing:
- Check the error messages in the server window
- Verify Python dependencies: `pip install -r requirements.txt`
- Check port 8000 is free: `netstat -ano | findstr :8000`

### Watchdog not working:
- Make sure Python is installed and in PATH
- Check file permissions
- Try running `python server_watchdog.py` manually

---

## ✅ Benefits

✅ **No more manual restarts** - Server auto-restarts on crash  
✅ **Better reliability** - Keeps your dashboard running  
✅ **Easy monitoring** - See all server activity  
✅ **Simple management** - Menu-driven interface  
✅ **Production-ready** - Robust error handling

---

**Now your backend will never stop unexpectedly! 🎉**

