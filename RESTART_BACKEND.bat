@echo off
title Restart Backend Server
color 0C

echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

echo Stopping existing backend processes...
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Backend*" >nul 2>&1

REM Kill processes on port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo.
echo Starting fresh backend server...
cd /d %~dp0backend
start "Backend Server" cmd /k "python api_server.py"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Backend Server Restarted!
echo ========================================
echo.
echo Backend URL: http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo.
echo Please wait 5-10 seconds for the server to fully start
echo.
pause

