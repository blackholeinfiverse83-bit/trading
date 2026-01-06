#!/usr/bin/env powershell
# Quick Backend Restart Script
# This script restarts the backend API server

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Restarting Multi-Asset Trading Dashboard Backend" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

# Kill any existing server on port 8000
Write-Host "Stopping existing server on port 8000..." -ForegroundColor Yellow
$ProcessOnPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | 
    Where-Object { $_.State -eq "Listen" } | 
    Select-Object -ExpandProperty OwningProcess

if ($ProcessOnPort) {
    Write-Host "Found process $ProcessOnPort on port 8000" -ForegroundColor Yellow
    Stop-Process -Id $ProcessOnPort -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Process stopped." -ForegroundColor Green
} else {
    Write-Host "No process found on port 8000" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow

# Start the backend server
Set-Location "$ScriptDir\backend"

try {
    & python api_server.py
} catch {
    Write-Host "Error starting backend server!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Python is installed: python --version"
    Write-Host "2. Make sure you're in the correct directory"
    Write-Host "3. Check if port 8000 is available"
    Write-Host ""
    pause
    exit 1
}
