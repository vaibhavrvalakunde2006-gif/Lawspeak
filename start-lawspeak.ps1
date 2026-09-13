# LawSpeak Unified Startup Script
# Run this from the lawspeak_final root directory

# Change to the directory where the script is located
Set-Location -Path $PSScriptRoot

Clear-Host
Write-Host "[*] Starting LawSpeak Development Stack..." -ForegroundColor Cyan
Write-Host "----------------------------------------"

# 1. Start FastAPI Backend
Write-Host "[1] Starting Backend (FastAPI on Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- LawSpeak Backend ---' -ForegroundColor Yellow; cd backend; uvicorn main:app --reload --port 8000"

# 2. Start Frontend Server
Write-Host "[2] Starting Frontend (Python on Port 3000)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- LawSpeak Frontend ---' -ForegroundColor Blue; cd frontend; python -m http.server 3000"

# 3. Start Ngrok Tunnel (Static Domain)
Write-Host "[3] Starting Static Ngrok Tunnel..." -ForegroundColor Green
Write-Host "[*] Domain: excaudate-eleonor-repudiatory.ngrok-free.dev" -ForegroundColor Gray
# Using the official binary location discovered earlier
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- Ngrok Tunnel ---' -ForegroundColor Green; & 'C:\Users\vaibh\Downloads\ngrok\ngrok.exe' http --url=excaudate-eleonor-repudiatory.ngrok-free.dev 8000"

Write-Host "[+] All services launched in separate windows." -ForegroundColor White
Write-Host "[*] Browse Locally: http://localhost:3000" -ForegroundColor Cyan
Write-Host "[*] Public API URL: https://excaudate-eleonor-repudiatory.ngrok-free.dev" -ForegroundColor Cyan
Write-Host "[!] Make sure you have authorized this domain in Firebase Console!" -ForegroundColor Magenta
