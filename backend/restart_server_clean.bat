@echo off
echo ========================================
echo CLEAN SERVER RESTART
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Stopping existing server...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [2] Clearing Python cache...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
echo Cache cleared.

echo [3] Starting server with fresh config...
echo.
python api_server.py

pause

