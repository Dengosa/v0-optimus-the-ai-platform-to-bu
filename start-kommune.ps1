# Kommune Startup Script
Write-Host "Starting Kommune..." -ForegroundColor Green

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\TINA\Downloads\kommune-landing-page-copy\kommune-backend-v2 (2)\kommune-rebuild\backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --host 0.0.0.0 --port 8000"

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start cloudflare tunnel and capture URL
Write-Host "Starting Cloudflare tunnel..." -ForegroundColor Yellow
$tunnelJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx cloudflared tunnel --url http://localhost:8000 2>&1 | Tee-Object -FilePath '$env:TEMP\tunnel.log'" -PassThru

# Wait for tunnel URL
Start-Sleep -Seconds 10

# Read tunnel URL from log
$tunnelLog = Get-Content "$env:TEMP\tunnel.log" -ErrorAction SilentlyContinue
$tunnelUrl = ($tunnelLog | Select-String "trycloudflare.com").Line
if ($tunnelUrl) {
    $url = ($tunnelUrl -split " ")[-1]
    Write-Host "Tunnel URL: $url" -ForegroundColor Cyan
    
    # Update .env.local
    $envContent = "NEXT_PUBLIC_API_URL=$url"
    Set-Content -Path "C:\Users\TINA\Downloads\kommune-landing-page-copy\.env.local" -Value $envContent
    Write-Host "Updated .env.local with new tunnel URL!" -ForegroundColor Green
}

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\TINA\Downloads\kommune-landing-page-copy'; npm run dev"

Write-Host "Kommune is starting! Check your terminals." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan