# Changelog

All notable changes to CityPulse Montréal 2035 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-01-XX

#### Project Structure

- Initialized repository structure with `frontend/`, `backend/`, and `data/` directories
- Created `.gitignore` for Python, Node.js, and data files
- Created `README.md` with project overview and setup instructions
- Created `PRD.md` reference file for product requirements
- Created `SETUP_GUIDE.md` with comprehensive setup instructions
- Created `data/README.md` with data download instructions

#### Backend (Flask API)

- Set up Flask project with virtual environment structure
- Created `requirements.txt` with all Python dependencies:
  - Flask, Flask-CORS
  - pandas, geopandas, shapely
  - requests, python-dotenv
  - groq, google-generativeai
  - numpy, pyproj, rtree
- Created `backend/app.py` - Main Flask application entry point
- Created `backend/.env.example` - Environment variable template
- Created `backend/scenario_engine.py` - Scenario adjustment logic for 2035 projections
- Created `backend/ai_services.py` - Groq and Gemini API integrations with caching

#### API Endpoints

- `GET /api/grid` - Returns GeoJSON grid with CSI metrics, supports scenario parameters
- `GET /api/hotspots` - Returns identified stress hotspots
- `GET /api/cell/<id>` - Returns detailed cell metrics, interventions, and AI summary
- `GET /api/trees` - Returns GeoJSON of existing tree locations
- `GET /api/planting-sites` - Returns GeoJSON of potential planting sites
- `POST /api/scenario/summary` - Generates AI narrative for 2035 scenarios

#### ETL Pipeline

- Created `backend/etl/build_grid.py` - Generates 250m x 250m grid covering Montréal
- Created `backend/etl/download_datasets.py` - Data download script with placeholder structure
- Created `backend/etl/compute_features.py` - Computes stress components and CSI for each cell
- Created `backend/etl/compute_interventions.py` - Calculates intervention scores and recommendations
- Created `backend/etl/data_loader.py` - Smart data loader that checks for real datasets with fallback to simulation

#### Data Infrastructure

- Implemented real data support with automatic detection
- Created data loader functions for all 9 Montréal datasets:
  - Air quality (RSQA)
  - Heat islands
  - Noise measurements
  - Traffic segments & travel times
  - Trees & planting sites
  - Canopy coverage
  - Climate vulnerability
- Added live API support for:
  - Entraves (traffic closures) - real-time JSON feed
  - OpenWeather API (optional)
- Implemented fallback to simulated data when real files are missing
- Added data availability checker that reports which files are found/missing

#### Frontend (Next.js)

- Initialized Next.js 14+ project with TypeScript and Tailwind CSS
- Installed dependencies:
  - maplibre-gl, react-map-gl
  - deck.gl and React bindings
  - @tanstack/react-query
- Created `frontend/types/index.ts` - TypeScript type definitions
- Created `frontend/lib/api.ts` - API client for backend communication
- Created `frontend/lib/colors.ts` - CSI color scale utilities

#### React Components

- `components/Header.tsx` - Project header with scenario year indicator
- `components/LayerToggles.tsx` - Layer visibility controls with CSI legend
- `components/ScenarioControls.tsx` - 2035 scenario sliders and narrative generator
- `components/CellDetailsPanel.tsx` - Detailed cell information display
- `components/CityPulseMap.tsx` - Main map component with MapLibre and deck.gl integration

#### Map Features

- Interactive MapLibre map centered on Montréal
- deck.gl layers for:
  - CSI grid with choropleth coloring (green → yellow → orange → red)
  - Existing trees (scatterplot layer)
  - Planting sites (scatterplot layer with priority)
  - Stress hotspots (highlighted cells with CSI > 70)
- Click/hover interactions for cell inspection
- Tooltip display for cell information

#### UI Features

- Full-screen map interface
- Floating panels for controls and details
- Scenario sliders for car dependence, transit, and tree investment
- AI-powered cell summaries (Groq integration)
- AI-powered scenario narratives (Gemini integration)
- Layer toggles with visual legend
- Responsive error handling and loading states

#### Documentation

- Comprehensive `README.md` with project overview
- Detailed `SETUP_GUIDE.md` with step-by-step instructions
- `data/README.md` with dataset download links and instructions
- Inline code comments and docstrings throughout

#### Scripts

- Created `backend/setup_and_run.sh` - Automated setup and run script

### Changed - 2025-01-XX

#### Data Processing

- Updated `compute_features.py` to support real data loading
- Modified all stress computation functions to check for real data first, fallback to simulation
- Enhanced data loader to handle multiple file formats (CSV, GeoJSON, Shapefile)

### Technical Details

#### Backend Architecture

- Flask REST API with CORS enabled
- Modular API structure with blueprints
- In-memory caching for AI responses
- GeoPandas for spatial operations
- Scenario engine with weighted stress adjustments

#### Frontend Architecture

- Next.js App Router with TypeScript
- React hooks for state management
- Dynamic imports for map components (SSR compatibility)
- Tailwind CSS for styling
- Responsive design with floating panels

#### Data Flow

1. ETL pipeline processes raw data → generates grid with CSI metrics
2. Flask API serves GeoJSON data to frontend
3. Frontend renders map with deck.gl layers
4. User interactions trigger API calls for details
5. AI services generate summaries on demand

---

## Version History

- **v0.1.0** (Initial Release) - Complete hackathon prototype with simulated data support
- **v0.2.0** (Planned) - Real data integration and production refinements

---

## Notes

- All dates are in YYYY-MM-DD format
- Changes are grouped by category (Added, Changed, Fixed, Removed, Security)
- Breaking changes are clearly marked
- Links to relevant issues/PRs can be added as needed
