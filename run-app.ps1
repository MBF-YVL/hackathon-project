# CityPulse Montréal 2035 - Run Full App
# This script sets up and runs both backend and frontend

Write-Host "=== CityPulse Montréal 2035 - Starting Full App ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend venv exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "Creating backend virtual environment..." -ForegroundColor Yellow
    cd backend
    python -m venv venv
    cd ..
}

# Activate venv and install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Check if data is processed
if (-not (Test-Path "data\processed\citypulse_grid.geojson")) {
    Write-Host ""
    Write-Host "Running ETL pipeline..." -ForegroundColor Yellow
    Write-Host "Step 1: Building grid..."
    python etl\build_grid.py
    Write-Host "Step 2: Computing features..."
    python etl\compute_features.py
    Write-Host "Step 3: Computing interventions..."
    python etl\compute_interventions.py
    Write-Host "ETL pipeline complete!" -ForegroundColor Green
} else {
    Write-Host "Data already processed, skipping ETL..." -ForegroundColor Green
}

# Start backend server
Write-Host ""
Write-Host "Starting backend server on port 5001..." -ForegroundColor Cyan
$env:PORT = "5001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; python app.py"
cd ..

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Check if frontend node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Start frontend server
Write-Host "Starting frontend server on port 3000..." -ForegroundColor Cyan
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
cd ..

Write-Host ""
Write-Host "=== App Started! ===" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5001" -ForegroundColor White
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop (close the PowerShell windows)" -ForegroundColor Yellow

