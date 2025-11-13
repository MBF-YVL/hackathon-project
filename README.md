# CityPulse Montréal 2035

**Build the World of Tomorrow** – A real-time urban stress digital twin for Montréal in 2035.

## Overview

CityPulse Montréal 2035 is a hackathon prototype demonstrating how city planners and operations teams will use AI-powered tools in 2035 to manage urban stress, climate challenges, and equity issues.

### Key Features

- 🗺️ **Interactive Urban Stress Map**: Real-time visualization of City Stress Index (CSI) across Montréal
- 🌡️ **Multi-Factor Analysis**: Air quality, heat islands, noise, traffic, transit crowding, and social vulnerability
- 🤖 **AI-Powered Interventions**: Smart recommendations for tree planting, car access restrictions, and transit improvements
- 🔮 **2035 Scenario Planning**: Explore future scenarios with adjustable parameters for car dependence, transit investment, and greening
- 📊 **Data-Driven Insights**: Built on real Montréal open data and public APIs

## Technology Stack

### Frontend
- **Next.js 14+** with TypeScript
- **MapLibre GL JS** for base mapping
- **deck.gl** for high-performance geospatial visualization
- **Tailwind CSS** for modern, responsive UI
- **React Query** for data fetching and caching

### Backend
- **Flask** REST API
- **GeoPandas** & **Shapely** for geospatial processing
- **Pandas** for data manipulation
- **Groq API** for fast LLM-powered cell summaries
- **Gemini API** for rich scenario narratives

### Data Sources
- Montréal Open Data Portal (air quality, heat islands, noise, traffic, trees, vulnerability)
- STM GTFS (transit data)
- OpenWeather API (weather data)
- Statistics Canada Census (demographics)

## Project Structure

```
hackathon-project/
├── backend/
│   ├── api/              # Flask API route handlers
│   ├── etl/              # ETL scripts for data processing
│   ├── data/
│   │   ├── raw/          # Downloaded datasets
│   │   └── processed/    # Computed grid with CSI metrics
│   ├── app.py            # Flask application entry point
│   ├── scenarios.py      # Scenario adjustment logic
│   ├── ai_services.py    # Groq & Gemini integrations
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and API client
│   ├── types/            # TypeScript type definitions
│   └── package.json      # Node.js dependencies
├── PRD.md                # Product Requirements Document
└── README.md             # This file
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

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

4. Create a `.env` file with your API keys:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

5. Run ETL pipeline to process data:
```bash
python etl/download_datasets.py
python etl/build_grid.py
python etl/compute_features.py
python etl/compute_interventions.py
```

6. Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
# Edit .env.local if needed
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Documentation

### Core Endpoints

#### `GET /api/grid`
Returns GeoJSON grid with CSI metrics for all cells.

**Query Parameters:**
- `scenario`: `current` (default) or `2035`
- `car`: Car dependence adjustment (-1.0 to 0.0)
- `trees`: Tree investment level (0.0 to 1.0)
- `transit`: Transit investment level (0.0 to 1.0)

#### `GET /api/hotspots`
Returns identified stress hotspots with summary statistics.

#### `GET /api/cell/<id>`
Returns detailed metrics, interventions, and AI-generated summary for a specific cell.

#### `GET /api/trees`
Returns GeoJSON of existing tree locations.

#### `GET /api/planting-sites`
Returns GeoJSON of potential tree planting sites with priority scores.

#### `POST /api/scenario/summary`
Generates a narrative summary of a 2035 scenario using Gemini.

## Data Attribution

This project uses open data from:
- [Montréal Open Data Portal](https://donnees.montreal.ca/)
- [Données Québec](https://www.donneesquebec.ca/)
- [STM Developer Portal](https://www.stm.info/en/about/developers)
- [Statistics Canada](https://www.statcan.gc.ca/)
- [OpenWeather](https://openweathermap.org/)

## License

This is a hackathon prototype created for educational and demonstration purposes.

## Team

CityPulse Montréal 2035 Team

---

**Built for the "Build the World of Tomorrow" Hackathon – November 2025**

