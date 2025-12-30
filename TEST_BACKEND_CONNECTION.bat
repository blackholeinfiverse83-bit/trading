@echo off
title Test Backend Connection
color 0B

echo ========================================
echo TESTING BACKEND CONNECTION
echo ========================================
echo.

echo Testing connection to http://127.0.0.1:8000/tools/health...
echo.

python -c "import requests; import sys; r = requests.get('http://127.0.0.1:8000/tools/health', timeout=5); print('[OK] Backend is responding!'); print('Status Code:', r.status_code); print('Response:', r.json())" 2>&1

if errorlevel 1 (
    echo.
    echo [FAIL] Backend is NOT responding
    echo.
    echo Possible reasons:
    echo   1. Backend server is not running
    echo   2. Backend server is stuck/hanging
    echo   3. Port 8000 is blocked
    echo.
    echo Solution:
    echo   Run KILL_AND_RESTART_BACKEND.bat to restart the backend
) else (
    echo.
    echo [SUCCESS] Backend is working correctly!
)

echo.
pause

