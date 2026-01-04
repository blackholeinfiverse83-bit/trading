@echo off
REM Run frontend development server from root directory
cd /d "%~dp0trading-dashboard"
if exist package.json (
    npm run dev
) else (
    echo Error: package.json not found in trading-dashboard directory!
    pause
    exit /b 1
)

