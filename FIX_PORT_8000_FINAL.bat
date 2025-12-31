@echo off
title Fix Port 8000 - Kill All and Start Fresh
color 0C

echo ========================================
echo FIXING PORT 8000 - KILL ALL AND START
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo [STEP 1] Killing ALL processes on ports 8000 and 8002...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8002.*LISTENING"') do (
    echo Killing process %%a on port 8002...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul
echo [OK] All processes killed
echo.

echo [STEP 2] Fixing .env file to use port 8000 ONLY...
if exist ".env" (
    echo Current UVICORN_PORT settings:
    findstr "UVICORN_PORT" .env
    echo.
    echo Updating to UVICORN_PORT=8000...
    powershell -Command "(Get-Content .env) -replace '^UVICORN_PORT=.*', 'UVICORN_PORT=8000' | Set-Content .env"
    echo [OK] Updated
    echo.
    echo After update:
    findstr "UVICORN_PORT" .env
) else (
    echo [INFO] No .env file - will use default port 8000
)
echo.

echo [STEP 3] Clearing environment variables...
set UVICORN_PORT=8000
echo [OK] Set UVICORN_PORT=8000 for this session
echo.

echo [STEP 4] Starting backend on port 8000...
echo.
echo IMPORTANT:
echo   - Backend MUST use port 8000 (frontend expects this)
echo   - Keep this window open!
echo   - Look for: "Server starting on http://127.0.0.1:8000"
echo   - NOT 8002!
echo.
echo ========================================
echo.

python api_server.py

pause

