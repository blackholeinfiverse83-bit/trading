@echo off
REM Multi-Asset Trading Dashboard - Windows Startup Script
REM This script starts both frontend and backend servers

setlocal enabledelayedexpansion

echo ================================================================
echo  Multi-Asset Trading Dashboard - Windows Startup
echo ================================================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: Not in the correct directory
    echo Please run this script from the root of the Multi-Asset Trading Dashboard project
    exit /b 1
)

if not exist "trading-dashboard" (
    echo Error: Not in the correct directory
    echo Please run this script from the root of the Multi-Asset Trading Dashboard project
    exit /b 1
)

echo Starting Backend Server...
echo Backend will run on: http://127.0.0.1:8000
echo.

cd backend
start "Backend Server" python api_server.py

REM Wait for backend to start
timeout /t 3 /nobreak

cd ..

echo Starting Frontend Server...
echo Frontend will run on: http://localhost:5173
echo.

cd trading-dashboard
start "Frontend Server" npm run dev

cd ..

echo ================================================================
echo All services started!
echo ================================================================
echo.
echo Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo.
echo Press any key to continue...
pause
