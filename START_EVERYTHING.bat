@echo off
REM ============================================================================
REM AUTO-START TRADING DASHBOARD - Backend + Frontend
REM ============================================================================
REM This script automatically starts both the backend API server and 
REM the frontend dev server in parallel

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  TRADING DASHBOARD - AUTO START (Backend + Frontend)
echo ============================================================================
echo.

REM Get the root directory
set ROOT_DIR=%~dp0

REM Define paths
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%trading-dashboard

echo [1/4] Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python is not installed or not in PATH
    echo Please install Python and add it to PATH
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [2/4] Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and add it to PATH
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo [3/4] Starting Backend Server (Port 8000)...
echo ============================================================================
cd /d "%BACKEND_DIR%"
start "Trading Dashboard Backend" python api_server.py
echo ✅ Backend server starting in new window...
echo    URL: http://127.0.0.1:8000
echo    Docs: http://127.0.0.1:8000/docs

REM Wait for backend to start
echo.
echo Waiting for backend server to initialize (5 seconds)...
timeout /t 5 /nobreak

echo.
echo [4/4] Starting Frontend Dev Server (Port 5173+)...
echo ============================================================================
cd /d "%FRONTEND_DIR%"
start "Trading Dashboard Frontend" cmd /k npm run dev
echo ✅ Frontend server starting in new window...
echo    URL: http://localhost:5173 (or next available port)

echo.
echo ============================================================================
echo ✅ AUTO-START COMPLETE!
echo ============================================================================
echo.
echo Frontend will open shortly at: http://localhost:5173
echo Backend API available at: http://127.0.0.1:8000
echo.
echo API Documentation: http://127.0.0.1:8000/docs
echo.
echo To stop the servers, close both terminal windows.
echo.
pause
