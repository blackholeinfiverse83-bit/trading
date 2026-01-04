@echo off
title Kill All Terminals - Quick
color 0C

echo ========================================
echo KILLING ALL TERMINALS AND SERVERS
echo ========================================
echo.

REM Enable delayed expansion for variables in loops
setlocal enabledelayedexpansion

echo Killing all processes on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo   Killing PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo.

echo Killing all processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173.*LISTENING"') do (
    echo   Killing PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo.

echo Killing Python processes (api_server.py)...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV 2^>nul ^| findstr /V "INFO:"') do (
    set PID=%%a
    set PID=!PID:"=!
    wmic process where "ProcessId=!PID!" get CommandLine /format:list 2^>nul | findstr "api_server.py" >nul
    if !errorlevel!==0 (
        echo   Killing Python PID !PID!...
        taskkill /F /PID !PID! >nul 2>&1
    )
)
echo.

echo Killing Node.js processes (Vite)...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV 2^>nul ^| findstr /V "INFO:"') do (
    set PID=%%a
    set PID=!PID:"=!
    wmic process where "ProcessId=!PID!" get CommandLine /format:list 2^>nul | findstr /i "vite" >nul
    if !errorlevel!==0 (
        echo   Killing Node PID !PID!...
        taskkill /F /PID !PID! >nul 2>&1
    )
)
echo.

echo Closing terminal windows...
taskkill /FI "WINDOWTITLE eq Backend Server*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Server*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend Server (Watchdog)*" /F >nul 2>&1
echo.

timeout /t 1 /nobreak >nul

echo ========================================
echo DONE! All processes killed.
echo ========================================
echo.
pause


