Set-Location "$PSScriptRoot\source\server\udp-server"
$host.ui.RawUI.WindowTitle = "1. UDP Server (Ports 9001/9002)"
$env:JAVA_HOME = "C:\Users\trann\.jdks\ms-21.0.8"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "=== KHOI DONG UDP SERVER (PORT 9001/9002) ===" -ForegroundColor Green
mvn exec:java "-Dexec.mainClass=com.auction.udp.UdpMetricsServerApp"
