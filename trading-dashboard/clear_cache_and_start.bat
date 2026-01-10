@echo off
echo Clearing Vite cache and restarting development server...

REM Clear Vite cache
if exist "node_modules\.vite" (
    echo Removing Vite cache...
    rmdir /s /q "node_modules\.vite"
)

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force

REM Start development server with force optimization
echo Starting development server...
npm run dev -- --force

pause