Set-Location "$PSScriptRoot\source\server\auction-core-service"
try { $host.ui.RawUI.WindowTitle = "2. Auction Core Service (HTTP 8080 / TCP 9090)" } catch {}
$env:JAVA_HOME = "C:\Users\trann\.jdks\ms-21.0.8"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

$env:UDP_METRICS_ENABLED = "true"
$env:UDP_METRICS_HOST = "127.0.0.1"
$env:UDP_METRICS_PORT = "9001"

Write-Host "=== KHOI DONG AUCTION CORE SERVICE (PORT 8080 / TCP 9090) ===" -ForegroundColor Green
./mvnw spring-boot:run
