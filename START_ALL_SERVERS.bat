@echo off
title Multi-Asset Trading Dashboard - Start All Servers
color 0B

echo ========================================
echo Multi-Asset Trading Dashboard
echo Starting Backend and Frontend Servers
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

echo [INFO] Python and Node.js found
echo.

REM Check if backend directory exists
if not exist "%SCRIPT_DIR%backend" (
    echo [ERROR] Backend directory not found: %SCRIPT_DIR%backend
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "%SCRIPT_DIR%trading-dashboard" (
    echo [ERROR] Frontend directory not found: %SCRIPT_DIR%trading-dashboard
    pause
    exit /b 1
)

echo [INFO] Starting Backend Server...
echo.

REM Start Backend Server with watchdog (auto-restart) in a new window
start "Backend Server (Watchdog)" cmd /k "cd /d %SCRIPT_DIR%backend && python server_watchdog.py"

REM Wait for backend to initialize
echo [INFO] Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [INFO] Starting Frontend Server...
echo.

REM Start Frontend Server in a new window
start "Frontend Server" cmd /k "cd /d %SCRIPT_DIR%trading-dashboard && npm run dev"

REM Wait a moment for frontend to start
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo           http://127.0.0.1:8000/docs (API Documentation)
echo.
echo Frontend: http://localhost:5173
echo.
echo Two windows have opened:
echo   - Backend Server
echo   - Frontend Server
echo.
echo IMPORTANT:
echo   - Authentication is ENABLED (check .env file)
echo   - Login with: admin / admin123
echo   - Close the windows to stop the servers
echo   - First prediction may take 60-90 seconds (model training)
echo.
echo Press any key to exit this window...
echo (Servers will continue running in their own windows)
pause >nul
