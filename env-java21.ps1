# Ưu tiên JNP_JAVA_HOME để có thể chọn JDK riêng cho project; nếu không thì dùng JAVA_HOME của máy.
if ($env:JNP_JAVA_HOME) {
    $env:JAVA_HOME = $env:JNP_JAVA_HOME
}

if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "Chưa có JAVA_HOME hợp lệ. Đặt JAVA_HOME hoặc JNP_JAVA_HOME tới JDK 21 rồi chạy lại." -ForegroundColor Red
    exit 1
}

$javaVersion = (& "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0 -or $javaVersion -notmatch 'version\s+"?21(?:[.+-]|\")') {
    Write-Host "Project cần JDK 21. JAVA_HOME hiện tại không trỏ tới JDK 21." -ForegroundColor Red
    & "$env:JAVA_HOME\bin\java.exe" -version
    exit 1
}

$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
Write-Host "=== Đã chọn JDK 21 cho cửa sổ PowerShell này ===" -ForegroundColor Green
java -version
