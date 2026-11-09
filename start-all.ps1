# Script khoi dong 4 phan he trong 4 cua so PowerShell rieng biet
$root = $PSScriptRoot

Write-Host "=== DANG KHOI DONG HE THONG DAU GIA BIEN SO XE ===" -ForegroundColor Cyan

# 1. UDP Server
Write-Host "1. Mo UDP Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$root\run-udp.ps1`""
Start-Sleep -Seconds 2

# 2. Auction Core Service
Write-Host "2. Mo Auction Core Service (Port 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$root\run-core.ps1`""
Start-Sleep -Seconds 2

# 3. Admin Console
Write-Host "3. Mo Admin Console GUI..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$root\run-admin.ps1`""
Start-Sleep -Seconds 2

# 4. Web Frontend
Write-Host "4. Mo Web Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$root\run-web.ps1`""

Write-Host "`nDa mo thanh cong 4 cua so terminal rieng biet!" -ForegroundColor Green
Write-Host "Frontend web truy cap tai: http://localhost:5173" -ForegroundColor White
