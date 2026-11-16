Set-Location "$PSScriptRoot\source\server\admin-console"
$host.ui.RawUI.WindowTitle = "3. Admin Console (Swing GUI)"
. "$PSScriptRoot\env-java21.ps1"

Write-Host "=== KHOI DONG GIAO DIEN ADMIN CONSOLE ===" -ForegroundColor Cyan
$jar = "target\admin-console-1.0.0-jar-with-dependencies.jar"
if (-not (Test-Path $jar)) {
    Write-Host "Chưa có jar, đang build Admin Console..." -ForegroundColor Yellow
    mvn -q -DskipTests package
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build Admin Console thất bại; xem lỗi Maven ở trên." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

java -jar $jar
