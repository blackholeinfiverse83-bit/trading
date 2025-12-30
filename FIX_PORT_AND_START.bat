@echo off
title Fix Port Issues and Start Backend
color 0E

echo ========================================
echo FIXING PORT ISSUES AND STARTING BACKEND
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo [STEP 1] Killing processes on port 8000...
set FOUND_8000=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    set FOUND_8000=1
    echo Found process %%a on port 8000 - killing it...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Could not kill process %%a
    ) else (
        echo [OK] Process %%a killed
    )
)
if %FOUND_8000%==0 (
    echo [OK] No processes on port 8000
)

echo.
echo [STEP 2] Killing processes on port 8002...
set FOUND_8002=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8002.*LISTENING"') do (
    set FOUND_8002=1
    echo Found process %%a on port 8002 - killing it...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Could not kill process %%a
    ) else (
        echo [OK] Process %%a killed
    )
)
if %FOUND_8002%==0 (
    echo [OK] No processes on port 8002
)

echo.
echo [STEP 3] Checking for .env file that might override port...
if exist ".env" (
    echo [INFO] .env file exists - checking UVICORN_PORT setting...
    findstr /C:"UVICORN_PORT" .env >nul 2>&1
    if errorlevel 1 (
        echo [OK] No UVICORN_PORT setting in .env - will use default 8000
    ) else (
        echo [WARN] Found UVICORN_PORT in .env file
        echo [WARN] Make sure it's set to 8000, not 8002
        type .env | findstr /C:"UVICORN_PORT"
    )
) else (
    echo [OK] No .env file - will use default port 8000
)

echo.
echo [STEP 4] Waiting 3 seconds for ports to be released...
timeout /t 3 /nobreak >nul

echo.
echo [STEP 5] Starting backend server on port 8000...
echo.
echo IMPORTANT:
echo   - Backend will run on port 8000 (frontend expects this)
echo   - Keep this window open!
echo   - Press Ctrl+C to stop
echo   - Look for "Server starting on http://127.0.0.1:8000" (NOT 8002!)
echo.
echo ========================================
echo.

REM Unset UVICORN_PORT environment variable to ensure we use the default (8000)
set UVICORN_PORT=

REM Also check if .env file has port setting
if exist ".env" (
    echo [INFO] Checking .env file for UVICORN_PORT setting...
    findstr /C:"UVICORN_PORT=8002" .env >nul 2>&1
    if not errorlevel 1 (
        echo [WARN] Found UVICORN_PORT=8002 in .env - this will override!
        echo [WARN] Consider changing it to UVICORN_PORT=8000 or removing it
        timeout /t 2 /nobreak >nul
    )
)

python api_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    echo Check for error messages above
    echo.
    pause
)

