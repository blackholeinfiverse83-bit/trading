@echo off
title Start Backend on Port 8000 ONLY
color 0A

echo ========================================
echo STARTING BACKEND ON PORT 8000 ONLY
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo [STEP 1] Killing ALL processes on ports 8000, 8002, 5173...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8002.*LISTENING"') do (
    echo Killing process %%a on port 8002...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173.*LISTENING"') do (
    echo Killing process %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul
echo [OK] Ports cleared
echo.

echo [STEP 2] Ensuring .env file uses port 8000...
if exist ".env" (
    findstr /C:"UVICORN_PORT=8002" .env >nul 2>&1
    if not errorlevel 1 (
        echo [FIX] Found UVICORN_PORT=8002 in .env - fixing...
        powershell -Command "(Get-Content .env) -replace 'UVICORN_PORT=8002', 'UVICORN_PORT=8000' | Set-Content .env"
        echo [OK] Updated to UVICORN_PORT=8000
    ) else (
        findstr /C:"UVICORN_PORT=" .env >nul 2>&1
        if errorlevel 1 (
            echo [INFO] No UVICORN_PORT in .env - adding UVICORN_PORT=8000...
            echo UVICORN_PORT=8000 >> .env
            echo [OK] Added UVICORN_PORT=8000
        ) else (
            echo [OK] .env already configured correctly
        )
    )
) else (
    echo [INFO] No .env file - will use default port 8000
)
echo.

echo [STEP 3] Starting backend server on port 8000...
echo.
echo IMPORTANT:
echo   - Backend will run on http://127.0.0.1:8000
echo   - Frontend will connect to this port
echo   - Keep this window open!
echo   - Press Ctrl+C to stop
echo.
echo ========================================
echo.

REM Ensure environment variable is set to 8000
set UVICORN_PORT=8000
python api_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    pause
)

