#!/usr/bin/env powershell
# ============================================================================
# KILL ALL RUNNING SERVERS - Backend + Frontend
# ============================================================================
# Safely terminates all running dashboard servers

Write-Host ""
Write-Host "============================================================================"
Write-Host " TRADING DASHBOARD - STOP ALL SERVERS" -ForegroundColor Yellow
Write-Host "============================================================================"
Write-Host ""

$stopped = 0
$errors = 0

# Kill Python processes (Backend)
Write-Host "[1/3] Stopping Backend Servers (Python)..." -ForegroundColor Yellow
try {
    $pythonProcesses = Get-Process -Name python -ErrorAction SilentlyContinue
    if ($pythonProcesses) {
        foreach ($process in $pythonProcesses) {
            # Check if it's our API server (running from backend dir)
            $processPath = $process.Path
            if ($processPath -like "*api_server*" -or $process.CommandLine -like "*api_server*") {
                Write-Host "   Killing Python process (PID: $($process.Id))" -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $stopped++
            }
        }
    }
    Write-Host "✅ Backend servers stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error stopping backend: $_" -ForegroundColor Yellow
    $errors++
}

# Kill Node processes (Frontend)
Write-Host "[2/3] Stopping Frontend Servers (Node.js)..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            Write-Host "   Killing Node process (PID: $($process.Id))" -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $stopped++
        }
    }
    Write-Host "✅ Frontend servers stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error stopping frontend: $_" -ForegroundColor Yellow
    $errors++
}

# Kill any cmd.exe that might be running dev servers
Write-Host "[3/3] Cleaning up terminal processes..." -ForegroundColor Yellow
try {
    $cmdProcesses = Get-Process -Name cmd -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*npm*" -or $_.CommandLine -like "*dev*"
    }
    if ($cmdProcesses) {
        foreach ($process in $cmdProcesses) {
            Write-Host "   Killing terminal (PID: $($process.Id))" -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $stopped++
        }
    }
    Write-Host "✅ Terminal cleanup complete" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error cleaning terminals: $_" -ForegroundColor Yellow
    $errors++
}

# Clear ports if needed
Write-Host ""
Write-Host "[4/3] Checking ports..." -ForegroundColor Yellow
try {
    $port8000 = Get-NetTCPConnection -LocalPort 8000 -State LISTEN -ErrorAction SilentlyContinue
    if ($port8000) {
        Write-Host "   ⚠️  Port 8000 still in use, attempting to clear..." -ForegroundColor Yellow
        $pid = $port8000.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-Host "   ✓ Port 8000 cleared" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Port 8000 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "   ℹ️  Could not check ports (may require admin)" -ForegroundColor Gray
}

# Final summary
Write-Host ""
Write-Host "============================================================================"
if ($errors -eq 0) {
    Write-Host "✅ ALL SERVERS STOPPED" -ForegroundColor Green
} else {
    Write-Host "⚠️  STOPPED WITH SOME WARNINGS (See above)" -ForegroundColor Yellow
}
Write-Host "============================================================================"
Write-Host ""
Write-Host "To start the servers again, run: START_EVERYTHING.bat or START_EVERYTHING.ps1"
Write-Host ""

Read-Host "Press ENTER to exit"
