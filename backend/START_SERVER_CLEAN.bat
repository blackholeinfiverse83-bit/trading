@echo off
title Backend Server - Clean Start
color 0A

echo ========================================
echo BACKEND SERVER - CLEAN START
echo ========================================
echo.

cd /d "%~dp0"

echo [STEP 1] Killing all processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Port 8000 cleared
echo.

echo [STEP 2] Starting server...
echo.
echo Server will start on http://127.0.0.1:8000
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

python api_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    pause
)

