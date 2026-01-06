#!/usr/bin/env powershell
# ============================================================================
# AUTO-START TRADING DASHBOARD - Backend + Frontend (PowerShell)
# ============================================================================
# This script automatically starts both the backend API server and 
# the frontend dev server in parallel with better error handling

param(
    [switch]$SkipWait = $false,
    [switch]$NoUI = $false
)

Write-Host ""
Write-Host "============================================================================"
Write-Host " TRADING DASHBOARD - AUTO START (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "============================================================================"
Write-Host ""

# Get script directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "trading-dashboard"

# Check Python
Write-Host "[1/5] Checking for Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Python not found!" -ForegroundColor Red
    Write-Host "Please install Python and add it to PATH"
    exit 1
}

# Check Node.js
Write-Host ""
Write-Host "[2/5] Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js and add it to PATH"
    exit 1
}

# Kill any existing processes on ports 8000 and 5173-5175
Write-Host ""
Write-Host "[3/5] Cleaning up old processes..." -ForegroundColor Yellow

try {
    $port8000 = Get-NetTCPConnection -LocalPort 8000 -State LISTEN -ErrorAction SilentlyContinue
    if ($port8000) {
        $pid = $port8000.OwningProcess
        Write-Host "   Found process on port 8000 (PID: $pid), terminating..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-Host "   ✓ Port 8000 cleared"
    }
} catch {}

Write-Host "✅ Cleanup complete" -ForegroundColor Green

# Start Backend Server
Write-Host ""
Write-Host "[4/5] Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Write-Host "============================================================================"

Push-Location $backendDir
$backendProcess = Start-Process -FilePath python -ArgumentList "api_server.py" `
    -WindowStyle Normal -PassThru -RedirectStandardOutput (Join-Path $backendDir "server.log")
Write-Host "✅ Backend server started (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "   URL: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "   Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Pop-Location

# Wait for backend to initialize
Write-Host ""
Write-Host "Waiting for backend server to initialize..." -ForegroundColor Gray
for ($i = 5; $i -gt 0; $i--) {
    Write-Host "   $i seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
}

# Verify backend is running
Write-Host ""
Write-Host "Verifying backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/tools/health" `
        -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy and responding!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend responding but status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify backend (may still be starting)" -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host ""
Write-Host "[5/5] Starting Frontend Dev Server (Port 5173+)..." -ForegroundColor Yellow
Write-Host "============================================================================"

Push-Location $frontendDir
$frontendProcess = Start-Process -FilePath cmd -ArgumentList "/k npm run dev" `
    -WindowStyle Normal -PassThru
Write-Host "✅ Frontend server started (PID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host "   URL: http://localhost:5173" -ForegroundColor Cyan
Pop-Location

# Summary
Write-Host ""
Write-Host "============================================================================"
Write-Host "✅ AUTO-START COMPLETE!" -ForegroundColor Green
Write-Host "============================================================================"
Write-Host ""
Write-Host "📊 SERVERS RUNNING:" -ForegroundColor Cyan
Write-Host "   Backend API:  http://127.0.0.1:8000 (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "   Frontend UI:  http://localhost:5173 (PID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "📚 DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "   Swagger UI:   http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "   ReDoc:        http://127.0.0.1:8000/redoc" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 TO STOP:" -ForegroundColor Yellow
Write-Host "   Close both terminal windows or run KILL_ALL_SERVERS.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 LOGS:" -ForegroundColor Cyan
Write-Host "   Backend logs: $backendDir\server.log" -ForegroundColor Gray
Write-Host ""

# Store process info for later cleanup
@{
    BackendPID = $backendProcess.Id
    FrontendPID = $frontendProcess.Id
    StartTime = Get-Date
    BackendURL = "http://127.0.0.1:8000"
    FrontendURL = "http://localhost:5173"
} | Export-Clixml (Join-Path $rootDir "running_processes.xml")

Write-Host "Press ENTER to continue..." -ForegroundColor Gray
Read-Host
