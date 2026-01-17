# Stop HTTP Server on port 8080
Write-Host "Stopping server on port 8080..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    $processes | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process $_" -ForegroundColor Green
    }
    Write-Host "Server stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "No server found running on port 8080." -ForegroundColor Yellow
}
