#!/bin/bash
# Setup and run script for CityPulse Montréal 2035 Backend

echo "=== CityPulse Montréal 2035 Backend Setup ==="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "Please create a .env file with your API keys."
    echo "See .env.example for the required variables."
    echo ""
fi

# Run ETL pipeline
echo ""
echo "=== Running ETL Pipeline ==="
echo ""

echo "Step 1: Building grid..."
python etl/build_grid.py

echo ""
echo "Step 2: Computing features..."
python etl/compute_features.py

echo ""
echo "Step 3: Computing interventions..."
python etl/compute_interventions.py

echo ""
echo "=== ETL Pipeline Complete ==="
echo ""
echo "Starting Flask server..."
echo "API will be available at http://localhost:5000"
echo ""

# Start Flask app
python app.py

