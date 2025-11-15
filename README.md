# CityPulse Montréal 2035

**Build the World of Tomorrow** - A real-time urban stress digital twin for Montréal in 2035.

## Overview

CityPulse Montréal 2035 is a hackathon prototype demonstrating how city planners and operations teams will use AI-powered tools in 2035 to manage urban stress, climate challenges, and equity issues. By 2035, cities like Montréal will be dense, sensor-rich, and facing increasing climate and social stress. This tool provides a **real-time urban stress digital twin** that helps planners make data-driven decisions about interventions and policy changes.

### Vision

Imagine a tool that city planners use in 2035 to:

- **Visualize urban stress** across every block of the city in real-time
- **Understand the drivers** of stress (air quality, heat, noise, traffic, transit, vulnerability)
- **Get AI-powered recommendations** for specific interventions (tree planting, car restrictions, transit improvements)
- **Model future scenarios** to see how policy changes affect the city's stress landscape

This prototype brings that vision to life using real Montréal open data, geospatial analysis, and AI.

## What is the City Stress Index (CSI)?

The **City Stress Index (CSI)** is a composite score from 0-100 that quantifies urban stress for each grid cell across Montréal. It combines six critical factors:

1. **Air Quality Stress** (20% weight) - Based on RSQA monitoring station data
2. **Heat Stress** (25% weight) - Urban heat island intensity
3. **Noise Stress** (15% weight) - Acoustic measurement data
4. **Traffic Stress** (25% weight) - Congestion and travel times
5. **Transit Crowding Stress** (15% weight) - Access and capacity issues
6. **Social Vulnerability** (multiplier) - Climate vulnerability and socio-economic factors

The formula: `CSI = (weighted sum of stress components) × vulnerability_multiplier`

Higher CSI values indicate areas needing more urgent intervention. The system identifies hotspots (CSI > 70) and provides location-specific recommendations.

## Key Features

### 🗺️ Interactive Urban Stress Map

- **21,574 hexagonal grid cells** covering Montréal and Laval
- Real-time visualization of CSI with color-coded cells (green = low stress, red = high stress)
- Click any cell to see detailed breakdown of stress components
- Toggle layers: CSI grid, existing trees, planting sites, hotspots

### 🌡️ Multi-Factor Analysis

- **Air Quality**: 96,361 measurements from 11 RSQA monitoring stations
- **Heat Islands**: 5 mapped heat zones
- **Noise Levels**: 551,402 acoustic measurements across the city
- **Traffic**: 331 road segments with real-time travel time data
- **Transit**: STM GTFS data for access and crowding analysis
- **Vulnerability**: 799,824 vulnerability zones from climate and census data

### 🤖 AI-Powered Interventions

- **Tree Planting**: 388,000+ potential planting sites prioritized by heat/air stress and vulnerability
- **Car Access Limits**: Smart recommendations for school streets, pedestrian zones, and low-traffic neighborhoods
- **Transit Improvements**: Suggestions for new stops, route tweaks, and frequency increases
- Each recommendation includes priority scores and expected CSI reduction

### 🔮 2035 Scenario Planning

- Adjustable sliders for:
  - **Car Dependence** (-100% to 0%): Reduce traffic, noise, and air pollution
  - **Transit Investment** (0% to +100%): Improve access and reduce crowding
  - **Tree/Greening Investment** (0% to +100%): Reduce heat islands and air pollution
- Real-time map updates showing scenario CSI vs current CSI
- AI-generated narratives explaining scenario impacts using Google Gemini

### 📊 Data-Driven Insights

- Built entirely on **real Montréal open data** (not simulated)
- **107,870 existing trees** mapped
- **514,124 canopy polygons** analyzed
- **Statistics Canada 2021 Census** data integrated for vulnerability analysis

### 🎨 Modern UI

- Futuristic 2035-themed design with glassmorphism effects
- Draggable and resizable scenario controls panel
- Custom scrollbars with cyan glow effects
- Smooth animations and responsive design
- Landing page with project overview and interactive map preview

## Technology Stack

### Frontend

- **Next.js 16** with TypeScript and React 19
- **MapLibre GL JS** for base mapping
- **deck.gl** for high-performance geospatial visualization
- **Tailwind CSS 4** for modern, responsive UI
- **Framer Motion** for smooth animations
- **React Query** for data fetching and caching
- **shadcn/ui** components for consistent design

### Backend

- **Flask 3.0** REST API with CORS support
- **GeoPandas** & **Shapely** for geospatial processing
- **Pandas** for data manipulation
- **NumPy** & **SciPy** for numerical computations
- **Groq API** for fast LLM-powered cell summaries
- **Google Gemini API** for rich scenario narratives

### Data Processing

- **ETL Pipeline**: Automated data download, processing, and grid generation
- **Spatial Analysis**: Grid creation, spatial joins, and coordinate transformations
- **Feature Engineering**: Stress component computation and CSI calculation
- **Intervention Scoring**: Priority-based recommendation engine

## Project Structure

```
hackathon-project/
├── backend/
│   ├── api/              # Flask API route handlers
│   │   ├── cells.py      # Cell detail endpoints
│   │   ├── grid.py       # Grid data endpoints
│   │   └── scenarios.py  # Scenario computation
│   ├── etl/              # ETL scripts for data processing
│   │   ├── download_datasets.py
│   │   ├── build_grid.py
│   │   ├── compute_features.py
│   │   └── compute_interventions.py
│   ├── data/
│   │   ├── raw/          # Downloaded datasets
│   │   └── processed/    # Computed grid with CSI metrics
│   ├── app.py            # Flask application entry point
│   ├── scenario_engine.py # Scenario adjustment logic
│   ├── ai_services.py    # Groq & Gemini integrations
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── page.tsx      # Landing page
│   │   └── map/
│   │       └── page.tsx # Interactive map application
│   ├── components/
│   │   ├── CityPulseMap.tsx
│   │   ├── CellDetailsPanel.tsx
│   │   ├── ScenarioControls.tsx
│   │   ├── LayerToggles.tsx
│   │   ├── Header.tsx
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # Utilities
│   ├── types/            # TypeScript type definitions
│   └── package.json      # Node.js dependencies
├── docs/
│   ├── PRD.md            # Product Requirements Document
│   └── STATUS.md         # Project status and data pipeline info
├── changelod.md          # Changelog
└── README.md             # This file
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- API keys for Groq and Google Gemini (optional, for AI features)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys (optional):

```bash
cp .env.example .env
# Edit .env and add:
# GROQ_API_KEY=your_groq_key
# GEMINI_API_KEY=your_gemini_key
```

5. Run ETL pipeline to process data:

```bash
python etl/download_datasets.py
python etl/build_grid.py
python etl/compute_features.py
python etl/compute_interventions.py
```

**Note**: The ETL pipeline downloads and processes real Montréal datasets. This may take some time depending on your internet connection. The processed grid will be saved to `backend/data/processed/citypulse_grid.geojson`.

6. Start the Flask server:

```bash
python app.py
```

The API will be available at `http://localhost:5001` (port 5001 to avoid conflicts with AirPlay on macOS).

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Quick Start (Both Services)

You can also use the provided PowerShell script to run both services:

```powershell
.\run-app.ps1
```

## API Documentation

### Core Endpoints

#### `GET /api/grid`

Returns GeoJSON grid with CSI metrics for all cells.

**Query Parameters:**

- `scenario`: `current` (default) or `2035`
- `car`: Car dependence adjustment (-1.0 to 0.0)
- `trees`: Tree investment level (0.0 to 1.0)
- `transit`: Transit investment level (0.0 to 1.0)

**Response:** GeoJSON FeatureCollection with cell geometries and properties including:

- `csi_current`: Current CSI score (0-100)
- `csi_scenario`: Scenario CSI score (if scenario params provided)
- `air_stress`, `heat_stress`, `noise_stress`, `traffic_stress`, `crowding_stress`: Component scores (0-1)
- `vulnerability_factor`: Vulnerability multiplier (0-1)
- `is_hotspot`: Boolean indicating if cell is a stress hotspot

#### `GET /api/hotspots`

Returns identified stress hotspots with summary statistics.

#### `GET /api/cell/<id>`

Returns detailed metrics, interventions, and AI-generated summary for a specific cell.

**Response includes:**

- Full stress component breakdown
- Intervention recommendations (trees, car limits, transit) with priority scores
- Expected CSI reduction for each intervention
- AI-generated summary (if Groq API key is configured)

#### `GET /api/trees`

Returns GeoJSON of existing tree locations (107,870 trees).

#### `GET /api/planting-sites`

Returns GeoJSON of potential tree planting sites with priority scores.

#### `POST /api/scenario/summary`

Generates a narrative summary of a 2035 scenario using Gemini.

**Request body:**

```json
{
  "car": -0.3,
  "transit": 0.5,
  "trees": 0.6,
  "aggregate_metrics": {
    "avg_csi_current": 60,
    "avg_csi_scenario": 40,
    "hotspot_count_current": 20,
    "hotspot_count_scenario": 8
  }
}
```

## Data Sources

This project uses real open data from:

- **[Montréal Open Data Portal](https://donnees.montreal.ca/)**:

  - RSQA air quality data (11 monitoring stations)
  - Urban heat islands
  - Acoustic noise measurements (551K+ data points)
  - Traffic segments and travel times
  - Public trees (127 MB dataset)
  - Tree planting sites (110 MB dataset)
  - Tree canopy coverage (785 MB, 514K polygons)
  - Climate vulnerability zones (443 MB, 799K zones)

- **[STM Developer Portal](https://www.stm.info/en/about/developers)**:

  - GTFS static and real-time transit data

- **[Statistics Canada](https://www.statcan.gc.ca/)**:

  - 2021 Census data for demographics and vulnerability analysis

- **[OpenWeather](https://openweathermap.org/)**:
  - Weather data for heat stress calculations

## Current Status

### ✅ Completed

- **Data Pipeline**: All 9 datasets integrated and processed
- **Backend API**: Flask API with all endpoints functional
- **Frontend**: Complete interactive map with all features
- **AI Integration**: Groq and Gemini APIs configured
- **UI/UX**: Futuristic 2035-themed design with glassmorphism
- **Scenario Engine**: Real-time scenario computation and visualization

### 📊 Data Statistics

- **Grid Cells**: 21,574 hexagonal cells
- **CSI Range**: 24.9 - 62.5 (mean: 42.6)
- **Trees Mapped**: 107,870
- **Planting Sites**: 388,000+ potential locations
- **Priority Sites**: 100 high-priority locations identified
- **Car Limit Zones**: 18,457 cells flagged
- **Transit Priority**: 12,610 cells needing improvements

## Team

**Team YVL** - Champlain Code Quest 2025

- Mir Faiyazur Rahman
- Aarush Patel
- Amine Baha
- Tamim Afghanyar

**Hackathon**: Champlain Code Quest 2025  
**Theme**: "Build the World of Tomorrow"

## License

This is a hackathon prototype created for educational and demonstration purposes.
