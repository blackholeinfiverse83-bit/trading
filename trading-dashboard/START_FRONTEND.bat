@echo off
echo Starting Multi-Asset Trading Dashboard Frontend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

REM Check if we're in the trading-dashboard directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the trading-dashboard directory
    pause
    exit /b 1
)

REM Clear Vite cache if it exists
if exist "node_modules\.vite" (
    echo Clearing Vite cache...
    rmdir /s /q "node_modules\.vite"
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting development server...
echo Frontend will be available at: http://localhost:5173
echo Backend should be running at: http://127.0.0.1:8000
echo.

npm run dev -- --force

pause