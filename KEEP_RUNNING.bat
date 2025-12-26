@echo off
title Trading Dashboard - Keep Running
color 0E

:MENU
cls
echo ========================================
echo Trading Dashboard - Server Manager
echo ========================================
echo.
echo 1. Start Both Servers (Auto-Restart Backend)
echo 2. Start Backend Only (with Watchdog)
echo 3. Start Frontend Only
echo 4. Check Server Status
echo 5. Stop All Servers
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto START_BOTH
if "%choice%"=="2" goto START_BACKEND
if "%choice%"=="3" goto START_FRONTEND
if "%choice%"=="4" goto CHECK_STATUS
if "%choice%"=="5" goto STOP_ALL
if "%choice%"=="6" goto EXIT

echo Invalid choice. Please try again.
timeout /t 2 /nobreak >nul
goto MENU

:START_BOTH
echo.
echo Starting both servers...
start "Backend Server (Watchdog)" cmd /k "cd /d %~dp0backend && python server_watchdog.py"
timeout /t 5 /nobreak >nul
start "Frontend Server" cmd /k "cd /d %~dp0trading-dashboard && npm run dev"
echo Servers started!
timeout /t 3 /nobreak >nul
goto MENU

:START_BACKEND
echo.
echo Starting backend with watchdog...
start "Backend Server (Watchdog)" cmd /k "cd /d %~dp0backend && python server_watchdog.py"
echo Backend started!
timeout /t 2 /nobreak >nul
goto MENU

:START_FRONTEND
echo.
echo Starting frontend...
start "Frontend Server" cmd /k "cd /d %~dp0trading-dashboard && npm run dev"
echo Frontend started!
timeout /t 2 /nobreak >nul
goto MENU

:CHECK_STATUS
cls
echo ========================================
echo Server Status Check
echo ========================================
echo.
echo Checking Backend (port 8000)...
netstat -ano | findstr :8000 >nul
if errorlevel 1 (
    echo Backend: NOT RUNNING
) else (
    echo Backend: RUNNING
    netstat -ano | findstr :8000 | findstr LISTENING
)
echo.
echo Checking Frontend (port 5173)...
netstat -ano | findstr :5173 >nul
if errorlevel 1 (
    echo Frontend: NOT RUNNING
) else (
    echo Frontend: RUNNING
    netstat -ano | findstr :5173 | findstr LISTENING
)
echo.
pause
goto MENU

:STOP_ALL
echo.
echo Stopping all Python and Node processes...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
echo All servers stopped.
timeout /t 2 /nobreak >nul
goto MENU

:EXIT
echo.
echo Exiting...
exit /b 0

