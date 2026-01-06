@echo off
REM Quick Backend Restart Script
REM This script restarts the backend API server

setlocal enabledelayedexpansion

echo ================================================================
echo  Restarting Multi-Asset Trading Dashboard Backend
echo ================================================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Kill any existing server on port 8000
echo Stopping existing server on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /PID %%a /F 2>nul
)

timeout /t 2 /nobreak

REM Start the backend server
echo Starting backend server...
cd /d "%SCRIPT_DIR%backend"
python api_server.py

if %errorlevel% neq 0 (
    echo.
    echo Error starting backend server!
    echo.
    echo Troubleshooting:
    echo 1. Make sure Python is installed: python --version
    echo 2. Make sure you're in the correct directory
    echo 3. Check if port 8000 is available
    echo.
    pause
    exit /b %errorlevel%
)
