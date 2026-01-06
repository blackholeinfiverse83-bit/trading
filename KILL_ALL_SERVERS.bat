@echo off
title Kill All Servers and Terminals
color 0C

echo ========================================
echo KILLING ALL SERVERS AND TERMINALS
echo ========================================
echo.

echo [STEP 1] Killing processes on port 8000 (Backend)...
set KILLED_8000=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    set KILLED_8000=1
    echo   Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   [WARN] Could not kill process %%a - may need admin rights
    ) else (
        echo   [OK] Process %%a killed
    )
)
if %KILLED_8000%==0 (
    echo   [OK] No processes found on port 8000
)
echo.

echo [STEP 2] Killing processes on port 5173 (Frontend/Vite)...
set KILLED_5173=0
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173.*LISTENING"') do (
    set KILLED_5173=1
    echo   Killing process %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   [WARN] Could not kill process %%a - may need admin rights
    ) else (
        echo   [OK] Process %%a killed
    )
)
if %KILLED_5173%==0 (
    echo   [OK] No processes found on port 5173
)
echo.

echo [STEP 3] Killing Python processes running api_server.py...
set KILLED_PYTHON=0
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr /V "INFO:"') do (
    set PID=%%a
    set PID=!PID:"=!
    for /f "tokens=1" %%b in ('wmic process where "ProcessId=!PID!" get CommandLine /format:list 2^>nul ^| findstr "api_server.py"') do (
        set KILLED_PYTHON=1
        echo   Killing Python process !PID! (api_server.py)...
        taskkill /F /PID !PID! >nul 2>&1
        if errorlevel 1 (
            echo   [WARN] Could not kill process !PID!
        ) else (
            echo   [OK] Process !PID! killed
        )
    )
)
if %KILLED_PYTHON%==0 (
    echo   [OK] No Python api_server.py processes found
)
echo.

echo [STEP 4] Killing Node.js/Vite processes...
set KILLED_NODE=0
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV 2^>nul ^| findstr /V "INFO:"') do (
    set PID=%%a
    set PID=!PID:"=!
    for /f "tokens=1" %%b in ('wmic process where "ProcessId=!PID!" get CommandLine /format:list 2^>nul ^| findstr /i "vite\|trading-dashboard"') do (
        set KILLED_NODE=1
        echo   Killing Node process !PID! (Vite/Frontend)...
        taskkill /F /PID !PID! >nul 2>&1
        if errorlevel 1 (
            echo   [WARN] Could not kill process !PID!
        ) else (
            echo   [OK] Process !PID! killed
        )
    )
)
if %KILLED_NODE%==0 (
    echo   [OK] No Node.js/Vite processes found
)
echo.

echo [STEP 5] Killing terminal windows with specific titles...
echo   Killing "Backend Server" windows...
taskkill /FI "WINDOWTITLE eq Backend Server*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend Server (Watchdog)*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Server*" /F >nul 2>&1
echo   [OK] Terminal windows closed
echo.

echo [STEP 6] Waiting 2 seconds for processes to fully terminate...
timeout /t 2 /nobreak >nul
echo.

echo [STEP 7] Final check - verifying ports are free...
echo   Checking port 8000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    echo   [WARN] Port 8000 still in use by process %%a
    echo   Attempting to force kill...
    taskkill /F /PID %%a >nul 2>&1
)

echo   Checking port 5173...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173.*LISTENING"') do (
    echo   [WARN] Port 5173 still in use by process %%a
    echo   Attempting to force kill...
    taskkill /F /PID %%a >nul 2>&1
)
echo.

echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo All servers and terminals have been killed.
echo Ports 8000 and 5173 should now be free.
echo.
echo You can now start fresh servers if needed.
echo.

pause





