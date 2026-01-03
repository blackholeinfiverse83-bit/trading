@echo off
title Backend Server - Start from Root
color 0A

echo ========================================
echo Starting Backend Server
echo ========================================
echo.

REM Change to backend directory (handles paths with spaces)
cd /d "%~dp0backend"

REM Set environment variables for rate limits
set RATE_LIMIT_PER_MINUTE=500
set RATE_LIMIT_PER_HOUR=10000

echo Rate limits set: 500/min, 10000/hour
echo.
echo Starting server...
echo.

python api_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    pause
)

