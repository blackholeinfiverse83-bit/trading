@echo off
title Fix and Start Trading Dashboard
color 0B

echo ========================================
echo MULTI-ASSET TRADING DASHBOARD
echo Fix Issues and Start Servers
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [STEP 1] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)
python --version
echo.

echo [STEP 2] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)
node --version
echo.

echo [STEP 3] Killing stuck processes on port 8000...
echo Checking for processes using port 8000...
set FOUND_PROCESS=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    set FOUND_PROCESS=1
    echo Found process %%a on port 8000 - killing it...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Could not kill process %%a - may need admin rights
    ) else (
        echo [OK] Process %%a killed successfully
    )
)
if %FOUND_PROCESS%==0 (
    echo [OK] No processes found on port 8000
)
timeout /t 3 /nobreak >nul
echo [OK] Port 8000 should be free now
echo.

echo [STEP 4] Starting Backend Server...
if not exist "%SCRIPT_DIR%backend" (
    echo [ERROR] Backend directory not found
    pause
    exit /b 1
)

REM Start backend in a new window
start "Backend Server" cmd /k "cd /d %SCRIPT_DIR%backend && python api_server.py"

echo [INFO] Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak

REM Check if backend is responding
echo [STEP 5] Checking if backend is responding...
python -c "import requests; r = requests.get('http://127.0.0.1:8000/tools/health', timeout=5); print('[OK] Backend is running!' if r.status_code == 200 else '[WARN] Backend returned status', r.status_code)" 2>nul
if errorlevel 1 (
    echo [WARN] Backend may still be starting up...
)
echo.

echo [STEP 6] Starting Frontend Server...
if not exist "%SCRIPT_DIR%trading-dashboard" (
    echo [ERROR] Frontend directory not found
    pause
    exit /b 1
)

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd /d %SCRIPT_DIR%trading-dashboard && npm run dev"

timeout /t 5 /nobreak

echo.
echo ========================================
echo SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo           http://127.0.0.1:8000/docs
echo.
echo Frontend: http://localhost:5173
echo.
echo Two windows have opened:
echo   - Backend Server
echo   - Frontend Server
echo.
echo IMPORTANT NOTES:
echo   - Authentication is DISABLED by default
echo   - If enabled, login with: admin / admin123
echo   - First prediction may take 60-90 seconds
echo   - Close the server windows to stop them
echo.
echo Press any key to exit...
pause >nul

