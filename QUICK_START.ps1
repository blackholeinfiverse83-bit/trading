#!/usr/bin/env powershell
# ============================================================================
# QUICK REFERENCE - Trading Dashboard Startup
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗"
Write-Host "║                   TRADING DASHBOARD - QUICK START                         ║"
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝"
Write-Host ""

Write-Host "🚀 FASTEST WAY TO START:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Double-click this file:" -ForegroundColor Yellow
Write-Host "   ┌─────────────────────────────┐"
Write-Host "   │  START_EVERYTHING.bat       │" -ForegroundColor Green
Write-Host "   └─────────────────────────────┘"
Write-Host ""
Write-Host "   ✅ Backend starts on port 8000"
Write-Host "   ✅ Frontend starts on port 5173"
Write-Host "   ✅ Takes ~6-7 seconds"
Write-Host "   ✅ Opens in 2 new windows"
Write-Host ""

Write-Host "📊 WHAT YOU'LL SEE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Window 1 (Backend):" -ForegroundColor Yellow
Write-Host "   ├─ Python process starting"
Write-Host "   ├─ FastAPI initialization"
Write-Host "   └─ http://127.0.0.1:8000 🟢"
Write-Host ""
Write-Host "   Window 2 (Frontend):" -ForegroundColor Yellow
Write-Host "   ├─ Node.js/Vite starting"
Write-Host "   ├─ Building your app"
Write-Host "   └─ http://localhost:5173 🟢"
Write-Host ""

Write-Host "🌐 THEN OPEN YOUR BROWSER:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Main Dashboard:" -ForegroundColor Yellow
Write-Host "   → http://localhost:5173"
Write-Host ""
Write-Host "   API Documentation:" -ForegroundColor Yellow
Write-Host "   → http://127.0.0.1:8000/docs"
Write-Host ""

Write-Host "🛑 TO STOP EVERYTHING:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Double-click this file:" -ForegroundColor Yellow
Write-Host "   ┌─────────────────────────────┐"
Write-Host "   │  KILL_ALL_SERVERS.ps1       │" -ForegroundColor Red
Write-Host "   └─────────────────────────────┘"
Write-Host ""
Write-Host "   OR simply close both windows"
Write-Host ""

Write-Host "📁 IMPORTANT FILES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Startup:" -ForegroundColor Yellow
Write-Host "   • START_EVERYTHING.bat  ← Use this (EASIEST)" -ForegroundColor Green
Write-Host "   • START_EVERYTHING.ps1  ← Advanced with logs"
Write-Host ""
Write-Host "   Shutdown:" -ForegroundColor Yellow
Write-Host "   • KILL_ALL_SERVERS.ps1  ← Use this to stop"
Write-Host ""
Write-Host "   Documentation:" -ForegroundColor Yellow
Write-Host "   • AUTO_START_GUIDE.md"
Write-Host "   • BACKEND_AUTO_START_SUMMARY.md"
Write-Host ""

Write-Host "⚡ QUICK COMMANDS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Start Only Backend:   cd backend && python api_server.py" -ForegroundColor Gray
Write-Host "   Start Only Frontend:  cd trading-dashboard && npm run dev" -ForegroundColor Gray
Write-Host "   Start Both:           npm run start:all" -ForegroundColor Gray
Write-Host ""

Write-Host "❓ TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Port 8000 already in use?" -ForegroundColor Yellow
Write-Host "   → Run KILL_ALL_SERVERS.ps1 first"
Write-Host ""
Write-Host "   Python not found?" -ForegroundColor Yellow
Write-Host "   → Install Python from python.org"
Write-Host ""
Write-Host "   Node.js not found?" -ForegroundColor Yellow
Write-Host "   → Install Node.js from nodejs.org"
Write-Host ""
Write-Host "   Frontend won't connect to backend?" -ForegroundColor Yellow
Write-Host "   → Check http://127.0.0.1:8000 is running"
Write-Host ""

Write-Host "📈 FEATURES AVAILABLE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Top Performers (scrollable)" -ForegroundColor Green
Write-Host "   • Add/remove trades instantly" -ForegroundColor Green
Write-Host "   • AI predictions (LONG/SHORT/HOLD)" -ForegroundColor Green
Write-Host "   • Portfolio tracking in INR (₹)" -ForegroundColor Green
Write-Host "   • Historical trading records" -ForegroundColor Green
Write-Host "   • Multi-asset support (Stocks/Crypto)" -ForegroundColor Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════════════════════╗"
Write-Host "║  ⭐ JUST DOUBLE-CLICK START_EVERYTHING.bat AND YOU'RE READY! ⭐           ║"
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝"
Write-Host ""

Read-Host "Press ENTER to see detailed documentation"

Write-Host ""
Write-Host "Opening AUTO_START_GUIDE.md for more details..."
if (Test-Path "AUTO_START_GUIDE.md") {
    & notepad "AUTO_START_GUIDE.md"
} else {
    Write-Host "AUTO_START_GUIDE.md not found" -ForegroundColor Yellow
}
