@echo off
echo ========================================
echo Starting Multi-Asset Trading Dashboard
echo ========================================
echo.

echo Starting Backend Server (with auto-restart)...
start "Backend Server" cmd /k "cd backend && python server_watchdog.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd trading-dashboard && npm run dev"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Two new windows will open - one for each server
echo Close those windows to stop the servers
echo.
pause

