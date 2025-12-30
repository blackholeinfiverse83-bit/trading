# Quick Connection Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Backend Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Backend on Port 8000
Write-Host "Testing http://127.0.0.1:8000/ ..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -UseBasicParsing -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Backend is RUNNING!" -ForegroundColor Green
    Write-Host "  Name: $($data.name)" -ForegroundColor White
    Write-Host "  Version: $($data.version)" -ForegroundColor White
    Write-Host "  Auth Status: $($data.auth_status)" -ForegroundColor White
} catch {
    Write-Host "✗ Backend is NOT running or not accessible" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend server first!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Health Endpoint" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $health = Invoke-WebRequest -Uri "http://127.0.0.1:8000/tools/health" -UseBasicParsing -TimeoutSec 5
    $healthData = $health.Content | ConvertFrom-Json
    Write-Host "✓ Health endpoint is working!" -ForegroundColor Green
    Write-Host "  Status: $($healthData.status)" -ForegroundColor White
} catch {
    Write-Host "✗ Health endpoint failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Connection Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

