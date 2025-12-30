# Connection Troubleshooting Guide

## ✅ Backend Status: RUNNING

The backend is confirmed running and responding at http://127.0.0.1:8000

## Common Connection Issues & Solutions

### Issue 1: "Unable to connect to backend server"

**Symptoms:**
- Frontend shows connection error
- Backend is actually running

**Solutions:**

1. **Clear Browser Cache**:
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Refresh page (F5)

2. **Check Browser Console**:
   - Press F12 → Console tab
   - Look for CORS errors
   - Look for network errors

3. **Verify Backend URL**:
   - Check `trading-dashboard/src/config.ts`
   - Should be: `http://127.0.0.1:8000`
   - NOT: `http://localhost:8000` (can cause CORS issues)

4. **Hard Refresh**:
   - Press `Ctrl+Shift+R` (Windows)
   - Or `Ctrl+F5`

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- Requests fail with CORS errors

**Solution:**
Backend CORS is already configured to allow all origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If still seeing CORS errors:
1. Check backend is actually running
2. Verify backend URL matches exactly
3. Clear browser cache

### Issue 3: Authentication Errors (401)

**Symptoms:**
- 401 Unauthorized errors
- "Invalid token" messages

**Solution:**
1. **Clear localStorage**:
   ```javascript
   // In browser console (F12)
   localStorage.removeItem('token');
   localStorage.removeItem('username');
   location.reload();
   ```

2. **Login again**:
   - Go to http://localhost:5173/login
   - Use: `admin` / `admin123`

### Issue 4: Timeout Errors

**Symptoms:**
- Requests timeout after 15 seconds
- "Request timeout" errors

**Solution:**
1. **Check backend is responding**:
   - Open: http://127.0.0.1:8000/docs
   - Should load Swagger UI

2. **Increase timeout** (if needed):
   - Edit `trading-dashboard/src/services/api.ts`
   - Change `timeout: 15000` to `timeout: 30000`

3. **Check network**:
   - Disable VPN if using
   - Check firewall settings

## Quick Diagnostic Steps

### Step 1: Verify Backend
```powershell
# Test backend directly
Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -UseBasicParsing
```

### Step 2: Test Login
```powershell
$body = @{username='admin'; password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri "http://127.0.0.1:8000/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Step 3: Check Frontend Config
- Open: `trading-dashboard/src/config.ts`
- Verify: `API_BASE_URL: 'http://127.0.0.1:8000'`

### Step 4: Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Try to load dashboard
4. Check if requests are being made
5. Check response status codes

## Expected Behavior

### ✅ Working Connection:
- Backend responds at http://127.0.0.1:8000
- Frontend loads at http://localhost:5173
- Login works and returns JWT token
- API calls succeed with 200 status
- Data loads from backend

### ❌ Connection Issues:
- Frontend shows "Unable to connect" error
- Network tab shows failed requests
- Console shows errors
- 401/403/500 errors

## Immediate Fix

If you're seeing connection errors right now:

1. **Refresh the frontend page** (F5)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check backend is running** (look for backend window)
4. **Try again** - connection should work

The backend is confirmed running, so the issue is likely:
- Browser cache
- CORS (though configured correctly)
- Network/firewall
- Frontend needs refresh

## Still Not Working?

1. **Restart both servers**:
   - Close backend window
   - Close frontend window
   - Run `START_ALL_SERVERS.bat`

2. **Check ports**:
   - Backend: 8000
   - Frontend: 5173
   - Make sure nothing else is using these ports

3. **Check firewall**:
   - Windows Firewall might be blocking
   - Add exception for Python and Node.js

4. **Check logs**:
   - Backend window shows errors?
   - Browser console shows errors?
   - Network tab shows what?



