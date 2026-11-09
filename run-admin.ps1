Set-Location "$PSScriptRoot\source\server\admin-console"
$host.ui.RawUI.WindowTitle = "3. Admin Console (Swing GUI)"
$env:JAVA_HOME = "C:\Users\trann\.jdks\ms-21.0.8"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "=== KHOI DONG GIAO DIEN ADMIN CONSOLE ===" -ForegroundColor Cyan
java -jar target/admin-console-1.0.0-jar-with-dependencies.jar
