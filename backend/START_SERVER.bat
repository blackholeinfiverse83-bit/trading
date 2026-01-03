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

REM Set rate limit environment variables
set RATE_LIMIT_PER_MINUTE=500
set RATE_LIMIT_PER_HOUR=10000

echo Rate limits set: 500/min, 10000/hour
echo.

cd /d "%~dp0"
python server_watchdog.py

pause

