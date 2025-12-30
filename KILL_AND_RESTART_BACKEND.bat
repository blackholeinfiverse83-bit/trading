@echo off
title Kill and Restart Backend Server
color 0C

echo ========================================
echo KILL AND RESTART BACKEND SERVER
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo [STEP 1] Finding processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000.*LISTENING"') do (
    set PID=%%a
    echo Found process %%a using port 8000
    echo Killing process %%a...
    taskkill /F /PID %%a
    if errorlevel 1 (
        echo [WARN] Could not kill process %%a - may need admin rights
    ) else (
        echo [OK] Process %%a killed
    )
)

echo.
echo [STEP 2] Waiting 3 seconds for port to be released...
timeout /t 3 /nobreak >nul

echo.
echo [STEP 3] Verifying port 8000 is free...
netstat -ano | findstr ":8000.*LISTENING" >nul
if errorlevel 1 (
    echo [OK] Port 8000 is now free
) else (
    echo [ERROR] Port 8000 is still in use!
    echo Please manually kill the process using the port
    pause
    exit /b 1
)

echo.
echo [STEP 4] Starting backend server...
echo.
echo Server will start in this window
echo Press Ctrl+C to stop the server
echo.

python api_server.py

pause

