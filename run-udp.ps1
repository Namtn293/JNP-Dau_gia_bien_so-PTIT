Set-Location "$PSScriptRoot\source\server\udp-server"
$host.ui.RawUI.WindowTitle = "1. UDP Server (Ports 9001/9002)"
. "$PSScriptRoot\env-java21.ps1"

Write-Host "=== KHOI DONG UDP SERVER (PORT 9001/9002) ===" -ForegroundColor Green
mvn exec:java "-Dexec.mainClass=com.auction.udp.UdpMetricsServerApp"
