@echo off
title Trading Dashboard - Server Launcher
color 0B

echo ========================================
echo Multi-Asset Trading Dashboard
echo Robust Server Launcher
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

echo Starting servers...
echo.

REM Start Backend Server with watchdog
start "Backend Server (Auto-Restart)" cmd /k "cd /d %~dp0 && START_BACKEND_WATCHDOG.bat"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

REM Start Frontend Server
start "Frontend Server" cmd /k "cd /d %~dp0trading-dashboard && npm run dev"

echo.
echo ========================================
echo Servers Started!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Two windows have opened:
echo   - Backend Server (will auto-restart if it crashes)
echo   - Frontend Server
echo.
echo To stop servers, close the respective windows
echo.
pause

