# Start HTTP Server for SWAASTRIX
Write-Host "Checking for existing server on port 8080..." -ForegroundColor Yellow
& "$PSScriptRoot\stop-server.ps1"
Start-Sleep -Seconds 1
Write-Host "Starting HTTP Server on port 8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npx --yes http-server . -p 8080 -c-1 --cors"
Start-Sleep -Seconds 2
Write-Host "Server should be running at http://localhost:8080" -ForegroundColor Green
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:8080"
