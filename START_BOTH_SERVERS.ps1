# PowerShell Script to Start Both Backend and Frontend Servers
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Multi-Asset Trading Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python and try again" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js and try again" -ForegroundColor Red
    exit 1
}

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:scriptDir
    Set-Location backend
    python api_server.py
} -Name BackendServer

Write-Host "Backend server starting in background (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend Server
Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:scriptDir
    Set-Location trading-dashboard
    npm run dev
} -Name FrontendServer

Write-Host "Frontend server starting in background (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers Status:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check Backend
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -TimeoutSec 2 -UseBasicParsing
    Write-Host "Backend:  RUNNING on http://127.0.0.1:8000" -ForegroundColor Green
} catch {
    Write-Host "Backend:  Starting... (may take a few seconds)" -ForegroundColor Yellow
}

# Check Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/" -TimeoutSec 2 -UseBasicParsing
    Write-Host "Frontend: RUNNING on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "Frontend: Starting... (may take a few seconds)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "To view server output:" -ForegroundColor Cyan
Write-Host "  Get-Job | Receive-Job -Keep" -ForegroundColor White
Write-Host ""
Write-Host "To stop servers:" -ForegroundColor Cyan
Write-Host "  Stop-Job -Name BackendServer,FrontendServer" -ForegroundColor White
Write-Host "  Remove-Job -Name BackendServer,FrontendServer" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  Receive-Job -Name BackendServer -Keep" -ForegroundColor White
Write-Host "  Receive-Job -Name FrontendServer -Keep" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

