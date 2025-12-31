@echo off
title Backend Server - Auto-Restart Watchdog
color 0A

echo ========================================
echo Backend Server - Auto-Restart Watchdog
echo ========================================
echo.
echo The server will automatically restart if it crashes
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"
python server_watchdog.py

pause



