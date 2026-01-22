# 🚀 QUICK START GUIDE - Phase 1 & 2 Testing

**Date:** January 21, 2026  
**Status:** Both Phase 1 & Phase 2 Ready for Testing  
**Environment:** Windows PowerShell  

---

## 📋 Prerequisites

✅ Backend running: `http://127.0.0.1:8000`  
✅ Frontend running: `http://localhost:5174`  
✅ Supabase credentials configured in `.env`  
✅ Health endpoint working: `http://127.0.0.1:8000/tools/health`  

---

## 🎬 Phase 1 Test (Health Monitoring)

### Verification Steps:

**1. Open Frontend Dashboard**
```
http://localhost:5174/dashboard
```

**2. Check Sidebar Bottom**
- Look for health indicator (colored dot)
- Should show: 🟢 Green (healthy), 🟡 Yellow (degraded), or 🔴 Red (unhealthy)
- Label should read "API Server"

**3. Hover Over Health Indicator**
- Tooltip appears showing:
  - ✅ Status: Healthy
  - 📊 CPU: X.X%
  - 💾 Memory: X.XXGB (X.X%)
  - 💿 Disk Free: X.XGB
  - 🤖 Models: N
  - ⏰ Updated: Just now

**4. Wait 30 Seconds**
- Indicator should update automatically
- "Updated" timestamp should change

**5. Stop Backend**
```powershell
# In backend terminal: Press Ctrl+C
```
- Indicator should turn 🔴 Red
- Error message should appear below indicator
- Shows "Failed to fetch health status"

**6. Restart Backend**
```powershell
cd "d:\blackhole projects\blackhole-infevers trade\Multi-Asset Trading Dashboard\backend"
python api_server.py
```
- Indicator should return to 🟢 Green
- Error message should disappear

---

## 🔐 Phase 2 Test (Authentication)

### Test 1: Login Success

**1. Navigate to Login Page**
```
http://localhost:5174/login
```

**2. Fill Login Form**
- Email: Your Supabase test account email
- Password: Your Supabase test account password

**3. Click "Sign In"**
- Button should show spinner
- Form inputs should disable
- Loading message: "Signing in..."

**4. Expected Results:**
- ✅ Green notification: "Login Successful"
- ✅ Redirects to `/dashboard` in ~500ms
- ✅ Dashboard loads with your session

**5. Verify Session**
- Check Sidebar - health indicator should be visible
- Click on profile menu (top-right)
- Should see your email displayed

---

### Test 2: Demo Credentials

**1. Go Back to Login Page**
- Click "Logout" first (see Test 3)
- Or navigate directly: http://localhost:5174/login

**2. Click "Fill Demo Credentials"**
- Email field fills: `demo@example.com`
- Password field fills: `demo123456`

**3. Note**
- This is for testing UI only
- Will fail login with Supabase
- Shows error: "Invalid login credentials" (expected)
- Tests error handling ✅

---

### Test 3: Logout Confirmation

**1. Login Successfully** (if not already)
- Use your real Supabase credentials
- Reach dashboard

**2. Open User Profile**
- Click top-right profile menu/avatar
- Select "Profile" or navigate to `/profile`

**3. Find Logout Button**
- Usually in top section or bottom of profile
- Red button with logout icon

**4. Click Logout**
- Modal appears: "Are you sure you want to logout?"
- Shows: Your session will be terminated.

**5. Click Cancel**
- Modal disappears
- You're still logged in
- Dashboard still accessible

**6. Click Logout Again**
- Modal appears again
- Click OK/Confirm

**7. Expected Results:**
- ✅ Modal closes
- ✅ Button shows loading spinner
- ✅ After ~500ms: Redirects to `/login`
- ✅ Cannot access `/dashboard` anymore
- ✅ Session cleared

---

### Test 4: Invalid Login

**1. Go to Login Page**
```
http://localhost:5174/login
```

**2. Enter Invalid Credentials**
- Email: `invalid@test.com`
- Password: `wrongpassword123`

**3. Click "Sign In"**
- Button shows spinner

**4. Expected Results:**
- ⚠️ Red error message appears: "Invalid login credentials"
- 🔴 Red notification toast: "Login Failed"
- Form stays visible (doesn't redirect)
- Can retry immediately

---

### Test 5: Validation Errors

**1. Test Email Validation**
- Enter invalid email: `notanemail`
- Click "Sign In"
- Error: "Please enter a valid email address"

**2. Test Required Fields**
- Leave email empty
- Click "Sign In"
- Error: "Email is required"

**3. Test Password Field**
- Leave password empty
- Click "Sign In"
- Error: "Password is required"

**4. Expected Behavior**
- Form doesn't submit
- Error shows immediately
- Can clear error by typing

---

## 🔧 Troubleshooting

### Issue: Health Indicator Not Showing
**Solution:**
1. Check backend is running: `http://127.0.0.1:8000/tools/health`
2. Check browser console for errors (F12)
3. Verify HealthProvider is in App.tsx
4. Clear browser cache and reload

### Issue: Login Fails Immediately
**Solution:**
1. Verify Supabase credentials in `.env`
2. Check Supabase URL is correct
3. Verify VITE_SUPABASE_ANON_KEY is set
4. Restart frontend: `npm run dev`

### Issue: Logout Button Not Showing
**Solution:**
1. Navigate to `/profile` directly
2. Check you're logged in
3. Check browser console for errors
4. Look for button labeled "Logout"

### Issue: Frontend Not Loading
**Solution:**
```powershell
# Kill existing process
netstat -ano | findstr :5174
taskkill /PID <PID> /F

# Restart
cd trading-dashboard
npm run dev
```

---

## 📊 Health Monitoring Details

### Status Meanings:

**🟢 Green (Healthy)**
- CPU < 80%
- Memory > 1GB available
- Server responding normally
- All models loaded

**🟡 Yellow (Degraded)**
- CPU 80-95%
- Memory 500MB-1GB available
- Server responsive but slower
- Some resource constraints

**🔴 Red (Unhealthy)**
- CPU > 95% OR Memory < 500MB
- Server not responding
- Network connection failed
- Critical resource shortage

**⚪ Gray (Offline)**
- Server unreachable
- Network error
- CORS issue
- Port not open

---

## 🎯 Feature Checklist

### Phase 1 (Health Monitoring)
- [x] Auto-polls every 30 seconds
- [x] Color-coded status indicator
- [x] Tooltip with metrics
- [x] Real-time updates
- [x] Error handling
- [x] Graceful offline handling

### Phase 2 (Authentication)
- [x] Supabase login integration
- [x] Email validation
- [x] Password security toggle
- [x] Demo credentials button
- [x] Success notifications
- [x] Error notifications
- [x] Logout confirmation modal
- [x] Auto-redirect on login
- [x] Session persistence
- [x] Responsive design

---

## 📱 Testing on Different Devices

### Desktop (1920x1080)
```
http://localhost:5174/login
```
- Full screen should show complete form
- Health indicator visible in sidebar
- All buttons easily accessible

### Tablet (768px)
```
# Open browser DevTools (F12)
# Click mobile device icon
# Select iPad/iPad Pro
# Reload page
```
- Form should reflow nicely
- Health indicator still visible
- Touch targets properly sized

### Mobile (375px)
```
# In DevTools mobile view
# Select iPhone SE or iPhone 12
```
- Form stacks vertically
- All inputs full width
- Buttons easily tappable

---

## 🐛 Debug Tips

### Browser Console (F12)
```javascript
// Check auth state
console.log('Auth:', useAuth());

// Check health status
console.log('Health:', useHealth());

// Check local storage
localStorage.getItem('supabase.auth.token');
```

### Network Tab (F12)
1. Open DevTools → Network tab
2. Reload page
3. Look for:
   - `login` request (POST to Supabase)
   - `health` request (GET to FastAPI)
   - Auth response with token

### Backend Logs
```powershell
# In backend terminal, look for:
INFO:     Started server process [XXXX]
INFO:     Application startup complete
GET  /tools/health - 200 OK
POST /tools/execute - 200 OK
```

---

## ✅ Final Verification

Before moving to Phase 3, confirm:

```
Health Monitoring (Phase 1):
☑ Indicator shows on sidebar
☑ Color changes correctly
☑ Tooltip displays metrics
☑ Updates every 30 seconds
☑ Handles offline gracefully

Authentication (Phase 2):
☑ Login page loads
☑ Supabase auth works
☑ Success notification shows
☑ Redirects to dashboard
☑ Logout confirmation shows
☑ Session cleared after logout
☑ Cannot access dashboard when logged out
☑ Validation errors show properly
☑ Demo credentials work (shows error)
```

---

## 🚀 Ready for Next Phase!

When all tests pass:

**Phase 3 will add:**
- Market Scan predictions integration
- Portfolio risk assessment
- Trade execution flow
- Analytics integration

**To start Phase 3:**
```powershell
# Notify when ready and I'll implement:
# 1. API service layer (tradingAPI.ts)
# 2. MarketScanPage integration
# 3. PortfolioPage risk management
# 4. Trade execution confirmation
# 5. Analytics integration
```

---

**Questions?** Check the error messages in:
- Browser console (F12)
- Backend terminal
- Notification toasts on screen

**Good luck with testing! 🎉**

