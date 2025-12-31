@echo off
title Clean Start Backend on Port 8000
color 0A

echo ========================================
echo CLEAN START - BACKEND ON PORT 8000
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo [STEP 1] Killing ALL Python processes (to kill all backend instances)...
taskkill /F /IM python.exe >nul 2>&1
if errorlevel 1 (
    echo [INFO] No Python processes found (or already killed)
) else (
    echo [OK] All Python processes killed
)
timeout /t 2 /nobreak >nul

echo.
echo [STEP 2] Killing processes on ports 8000 and 8002...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8002.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo [OK] Ports cleared
echo.

echo [STEP 3] Fixing .env file to use port 8000 ONLY...
if exist ".env" (
    powershell -Command "$content = Get-Content .env; $newContent = $content | Where-Object { $_ -notmatch '^UVICORN_PORT=' }; $newContent += 'UVICORN_PORT=8000'; $newContent | Set-Content .env"
    echo [OK] .env file set to UVICORN_PORT=8000
) else (
    echo [INFO] No .env file - will use default port 8000
)
echo.

echo [STEP 4] Starting backend on port 8000...
echo.
echo IMPORTANT:
echo   - Backend will run on http://127.0.0.1:8000
echo   - Frontend will connect to this port
echo   - Keep this window open!
echo.
echo ========================================
echo.

set UVICORN_PORT=8000
python api_server.py

pause

