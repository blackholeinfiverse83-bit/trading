@echo off
title Backend Server - Port 8000
color 0A

echo ========================================
echo STARTING BACKEND SERVER
echo ========================================
echo.

cd /d "%~dp0backend"

echo Current directory: %CD%
echo.

REM Kill any processes on port 8000
echo [STEP 1] Clearing port 8000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Port cleared
echo.

echo [STEP 2] Starting backend server...
echo.
echo IMPORTANT:
echo   - Server will run in this window
echo   - Look for "Server starting on http://127.0.0.1:8000"
echo   - Press Ctrl+C to stop the server
echo   - Keep this window open!
echo.
echo ========================================
echo.

python api_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    echo Check the error messages above
    pause
)


