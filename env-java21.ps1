# Script thiết lập tạm thời JDK 21 cho cửa sổ Terminal hiện tại
# Lưu ý: Chỉ có tác dụng trong cửa sổ terminal này, KHÔNG làm thay đổi Windows hay các ứng dụng khác.

$env:JAVA_HOME = "C:\Users\trann\.jdks\ms-21.0.8"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "=== Đã chuyển sang JDK 21 thành công cho Terminal này ===" -ForegroundColor Green
java -version
