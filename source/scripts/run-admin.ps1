$repoRoot = (Resolve-Path "$PSScriptRoot\..\..").Path
Set-Location "$repoRoot\source\server\admin-console"
try { $host.ui.RawUI.WindowTitle = "3. Admin Console (Swing GUI)" } catch {}
$env:JAVA_HOME = "C:\Users\trann\.jdks\ms-21.0.8"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "=== KHOI DONG GIAO DIEN ADMIN CONSOLE ===" -ForegroundColor Cyan
if (-not (Test-Path "target\admin-console-1.0.0-jar-with-dependencies.jar")) {
    Write-Host "Dang bien dich file jar admin-console..." -ForegroundColor Yellow
    mvn clean package -DskipTests
}
if (Test-Path "target\admin-console-1.0.0-jar-with-dependencies.jar") {
    java -jar target/admin-console-1.0.0-jar-with-dependencies.jar
} else {
    mvn compile exec:java "-Dexec.mainClass=com.auction.AdminConsoleApp"
}
