@echo off
title Start Backend Server (Fresh)
color 0A

echo ========================================
echo STARTING BACKEND SERVER (FRESH START)
echo ========================================
echo.

REM Get the script directory  
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo Current directory: %CD%
echo.

REM Kill any existing processes on port 8000 and 8002
echo [STEP 1] Checking for existing processes on port 8000...
set FOUND_PROC=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    set FOUND_PROC=1
    echo Found existing process %%a on port 8000 - killing it...
    taskkill /F /PID %%a >nul 2>&1
)
if %FOUND_PROC%==0 echo [OK] No processes on port 8000

echo.
echo [STEP 1b] Checking for existing processes on port 8002...
set FOUND_PROC=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8002.*LISTENING"') do (
    set FOUND_PROC=1
    echo Found existing process %%a on port 8002 - killing it...
    taskkill /F /PID %%a >nul 2>&1
)
if %FOUND_PROC%==0 echo [OK] No processes on port 8002

timeout /t 2 /nobreak >nul

echo.
echo [STEP 2] Ensuring backend uses port 8000 (clearing any port env vars)...
set UVICORN_PORT=
echo [OK] Environment cleared - will use default port 8000

echo.
echo [STEP 3] Starting backend server...
echo.
echo IMPORTANT:
echo   - Server will run in this window
echo   - Look for "Server starting on http://127.0.0.1:8000"
echo   - Press Ctrl+C to stop the server
echo   - Keep this window open while using the app
echo.
echo ========================================
echo.

python api_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    echo Check for error messages above
    echo Common issues:
    echo   - Python not installed
    echo   - Dependencies not installed (run: pip install -r requirements.txt)
    echo   - Port 8000 already in use
    echo.
    pause
)

