@echo off
title Backend Server - Auto Restart Watchdog
color 0A

echo ========================================
echo Backend Server with Auto-Restart
echo ========================================
echo.
echo This will keep restarting the server if it crashes
echo Press Ctrl+C to stop
echo.

:START_SERVER
cd /d "%~dp0backend"
echo [%time%] Starting backend server...
python api_server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo [%time%] Server crashed or stopped!
    echo ========================================
    echo Restarting in 5 seconds...
    timeout /t 5 /nobreak >nul
    goto START_SERVER
) else (
    echo.
    echo [%time%] Server stopped normally
    pause
)

