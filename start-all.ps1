# Smart Healthcare Ecosystem - Launch All Services in PowerShell
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🏥 Launching Smart Healthcare Ecosystem Services" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start Ollama (if not already running)
$ollamaRunning = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if (-not $ollamaRunning) {
    Write-Host "⚡ Starting Ollama server in background..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
} else {
    Write-Host "✅ Ollama is already running on port 11434" -ForegroundColor Green
}

# 2. Start FastAPI AI Microservice (Port 8000)
Write-Host "🧠 Starting FastAPI AI Microservice on http://localhost:8000..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ai-service'; .\venv\Scripts\uvicorn app.main:app --reload --port 8000"

# 3. Start Node.js Express Backend (Port 5000)
Write-Host "🚀 Starting Node.js Express Backend on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# 4. Start React Frontend (Port 5173)
Write-Host "🎨 Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend\client'; npm run dev"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🎉 All services triggered!" -ForegroundColor Green
Write-Host "   Frontend:       http://localhost:5173" -ForegroundColor White
Write-Host "   Node.js API:    http://localhost:5000" -ForegroundColor White
Write-Host "   FastAPI AI:     http://localhost:8000 (Swagger: /docs)" -ForegroundColor White
Write-Host "   Ollama:         http://localhost:11434" -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Cyan
