Set-Location "$PSScriptRoot\source\server\auction-core-service"
try { $host.ui.RawUI.WindowTitle = "2. Auction Core Service (HTTP 8080 / TCP 9090)" } catch {}
. "$PSScriptRoot\env-java21.ps1"

$env:UDP_METRICS_ENABLED = "true"
$env:UDP_METRICS_HOST = "127.0.0.1"
$env:UDP_METRICS_PORT = "9001"

Write-Host "=== KHOI DONG AUCTION CORE SERVICE (PORT 8080 / TCP 9090) ===" -ForegroundColor Green
./mvnw spring-boot:run
