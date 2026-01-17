# Start HTTP Server for SWAASTRIX (stops existing server first)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptPath\stop-server.ps1"
Start-Sleep -Seconds 1
Write-Host "Starting HTTP Server on port 8080..." -ForegroundColor Green
npx --yes http-server . -p 8080 -o
