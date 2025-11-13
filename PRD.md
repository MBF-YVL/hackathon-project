# CityPulse Montréal 2035 – Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2025-11-13  
**Project Type:** Hackathon prototype  
**Theme:** _Build the World of Tomorrow_ – tools people will use in **2035**  
**Team:** CityPulse Montréal 2035

---

\_# CityPulse Montréal 2035 – Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2025-11-13  
**Project Type:** Hackathon prototype  
**Theme:** _Build the World of Tomorrow_ – tools people will use in **2035**  
**Team:** CityPulse Montréal 2035

---

## 1. Overview

### 1.1 Vision

By 2035, Montréal is dense, sensor-rich, and under climate/social stress.  
**CityPulse Montréal 2035** is a prototype of the tool city planners and operations teams will use in that year:

- A **real-time urban stress digital twin** of Montréal.
- Computes a **City Stress Index (CSI)** for every block, based on:
  - Air pollution
  - Noise
  - Traffic / congestion
  - Heat / urban heat islands
  - Transit access & crowding
  - Social vulnerability
- Uses AI to suggest **location-specific interventions**:
  - 🌳 Trees & greening
  - 🚗 Car access limits (school streets, pedestrian streets, low-traffic zones)
  - 🧭 Transit changes (new stops, small route tweaks, frequency boosts)
- Allows exploration of **2035 scenarios** (reduced car dependence, increased transit & trees).

The hackathon prototype is a **simplified, data-driven version** of this 2035 system:
a **web application (Next.js + MapLibre + deck.gl)** backed by a **Flask API** with:

- Precomputed CSI grid over Montréal
- Simple heuristic AI intervention engine
- LLM-powered textual explanations (Groq primary, Gemini for richer narratives)

---

## 2. Goals & Non-Goals

### 2.1 Goals

1. **Demonstrate a believable 2035 planning tool**

   - Show how data + AI + visualization give planners a “city stress twin” for Montréal.

2. **Deliver an interactive map UI**

   - MapLibre + deck.gl map of Montréal, with CSI grid overlay.
   - Hover/click to inspect cells, see CSI breakdown and suggested interventions.

3. **Implement core AI intervention logic** (rule-based / heuristic):

   - For each cell/hotspot, propose:
     - Tree planting interventions.
     - Car access restrictions.
     - Transit improvements.

4. **Implement a 2035 scenario slider**:

   - Adjust high-level parameters (car dependence, transit investment, tree investment).
   - Recompute and visualize “2035 CSI” vs “current CSI”.

5. **Integrate real open data** (not pure toy numbers):
   - Use Montréal open data & public APIs where feasible.
   - Simulate/approximate missing pieces but keep the pipeline realistic.

### 2.2 Non-Goals (Hackathon Scope)

- Real-time ingestion of streaming sensor data (we’ll use snapshots or simplified updates).
- Full traffic and transit microsimulation.
- Perfect scientific accuracy of stress models.
- Production-grade auth, multi-user collaboration, or full accessibility.

---

## 3. Users & Use Cases

### 3.1 Personas (2035)

1. **Urban Planner / Climate Planner (Primary)**

   - Needs to prioritize investments in greening and car restrictions.
   - Cares about long-term resilience and equity.

2. **Transit Planner**

   - Focuses on expanding transit accessibility and reducing car dependence.
   - Wants to see where new stops/service can reduce stress.

3. **City Operations Analyst (Secondary)**

   - Monitors daily issues (events, roadworks, heat spikes).
   - Uses CityPulse for situational awareness and quick response ideas.

4. **Executive / Decision-Maker**
   - Uses high-level 2035 scenarios and narratives to compare policy packages.

### 3.2 Key Use Cases

1. **UC1 – Explore today’s stress hotspots**

   - Planner opens map → sees CSI choropleth.
   - Selects top hotspot → sees drivers (heat vs traffic vs noise), vulnerability, and suggested interventions.

2. **UC2 – Plan tree interventions**

   - Filter to “heat + air” hotspots with high vulnerability.
   - View candidate tree planting streets and planting sites with priority scores.

3. **UC3 – Plan car access policies**

   - Focus on residential/school areas with high traffic & noise.
   - See suggested school streets / pedestrian zones and estimated stress reduction.

4. **UC4 – Identify transit deserts**

   - Show cells with high traffic stress + poor transit access + high population.
   - See suggested new stops and frequency boosts.

5. **UC5 – Run a 2035 scenario**
   - Adjust sliders: car dependence ↓, transit investment ↑, tree investment ↑.
   - Map updates to show new CSI patterns.
   - Scenario summary explains how the city’s stress and equity map changes.

---

## 4. Functional Requirements

### 4.1 Map & Visualization

**FR1 – Map display**

- The system must display a **MapLibre GL JS** map centered on Montréal.
- An overlay must show a **CSI grid** using deck.gl.

**FR2 – Interaction**

- Users can:
  - Pan, zoom, rotate the map.
  - Hover over cells to see CSI tooltip.
  - Click on a cell to view detailed breakdown and interventions in a side panel.

**FR3 – Layer toggles**

- User can toggle layers:
  - CSI grid (current scenario).
  - CSI grid (2035 scenario) or combined.
  - Trees (existing).
  - Planting sites (potential).
  - Traffic/entraves.
  - Vulnerability overlay.

**FR4 – Scenario controls**

- A UI control (slider(s) and switches) must allow the user to adjust:
  - Car dependence level.
  - Transit investment level.
  - Tree investment level.
- The map must update to show scenario CSI (via new data from backend).

---

### 4.2 CSI Computation & Hotspots

**FR5 – CSI per grid cell**

- For each cell, the backend must compute:
  - `air_stress`
  - `heat_stress`
  - `noise_stress`
  - `traffic_stress`
  - `crowding_stress`
  - `vulnerability_factor`
  - `csi_current`
  - `csi_scenario` (if scenario parameters provided)

**FR6 – CSI formula**

- The backend must implement a weighted sum (0–100) for CSI.

**FR7 – Hotspot detection**

- The backend must identify “hotspots” as:
  - Clusters of cells with `csi_current` above a configurable threshold.
- Each hotspot includes:
  - ID, centroid, average CSI and component scores, and vulnerability summary.

---

### 4.3 Interventions

**FR8 – Tree intervention recommendations**

- For each cell (or hotspot), the backend must:
  - Compute a **tree priority score** based on:
    - High `heat_stress`, `air_stress`.
    - Low canopy and presence of plantable sites.
    - High vulnerability.
  - Suggest:
    - Approximate number of trees or planting “corridor”.
    - Estimated reduction in `heat_stress`/`air_stress` and CSI.

**FR9 – Car limit recommendations**

- For cells/segments with high traffic/noise near sensitive uses:
  - Compute a **car limit score**.
  - Propose one or more policy types:
    - School street (time-limited).
    - Pedestrian street.
    - Low-traffic neighborhood filter.
  - Provide approximate stress reduction for the cell and note possible rerouting concerns.

**FR10 – Transit recommendations**

- For cells with high population, high traffic stress, and poor transit access:
  - Compute a **transit improvement score**.
  - Propose:
    - New stop on existing route OR
    - Frequency increase on a relevant line.
  - Estimate impact on `traffic_stress`/`crowding_stress`.

---

### 4.4 2035 Scenario Engine

**FR11 – Scenario request**

- Backend must expose an endpoint to compute CSI under a scenario:
  - Input: parameters for car, transit, trees (and optional factors).
  - Output: new CSI per cell (`csi_scenario`).

**FR12 – Scenario visual comparison**

- Frontend must be able to:
  - Render scenario CSI in the same grid (e.g., color scale).
  - Optionally provide:
    - Single-map slider (morph current → scenario).
    - Or dual-map side-by-side (stretch goal).

---

### 4.5 AI Text Summaries (Groq + Gemini)

**FR13 – Cell summary (Groq)**

- When a user clicks a cell, the backend may:
  - Use Groq’s LLM to generate a short explanation of:
    - Why this cell is stressed.
    - Which interventions are suggested.
    - Approximate impact.
- Must be under a fixed token budget for latency/rate reasons.

**FR14 – Scenario narrative (Gemini)**

- On demand (e.g., “Explain this scenario” button), backend may:
  - Use Gemini to generate a more narrative 2035 story:
    - How the scenario changes the experience of Montréalers.
    - High-level summary of winners/losers and equity impacts.
- Must limit usage due to API rate limits.

---

## 5. Non-Functional Requirements

- **NFR1 – Performance:**

  - Map interactions (pan/zoom) must feel smooth on a typical laptop.
  - CSI grid should load in < 2–3 seconds after initial request (for hackathon dataset size).

- **NFR2 – Reliability (hackathon-level):**

  - If an API fails (e.g., STM, OpenWeather), fall back to last cached data or simulated defaults.

- **NFR3 – Privacy:**

  - All data is aggregated to grid-level (no individual-level or sensitive personal data).

- **NFR4 – Simplicity:**
  - Focus on clear, understandable logic; not black-box ML.

---

## 6. Data Sources & APIs

> Note: For the hackathon, we can pre-download datasets and run ETL offline to produce a single grid file consumed by the app. Live API calls (OpenWeather, STM, entraves) are a bonus.

### 6.1 Air Quality – RSQA Multi-pollutants

- **Dataset:** RSQA – Polluants gazeux en continu
- **URL:** `https://donnees.montreal.ca/dataset/rsqa-polluants-gazeux`
- **Type:** CSV
- **Access Steps:**
  1. Open dataset page.
  2. Under **Ressources**, pick CSV resource.
  3. Use the resource URL with `requests.get()` in ETL.
- **ETL Use:**
  - Aggregate pollutant concentration per station over a target period.
  - Map stations to grid cells (nearest or weighted).
  - Normalize to create `air_stress` 0–1.

---

### 6.2 Heat – Îlots de chaleur + OpenWeather

#### 6.2.1 Îlots de chaleur (Urban Heat Islands)

- **Dataset:** Îlots de chaleur
- **URL:** `https://donnees.montreal.ca/dataset/ilots-de-chaleur`
- **Type:** GeoJSON/SHP/TIFF
- **Access:**
  - Download GeoJSON resource, load via GeoPandas.
- **ETL Use:**
  - Intersect heat island polygons with grid cells.
  - Assign `heat_stress` based on relative intensity.

#### 6.2.2 Weather – OpenWeather One Call API 3.0

- **Product:** One Call 3.0
- **Docs:** `https://openweathermap.org/api/one-call-3`
- **Type:** REST (API key, free tier)
- **Access Steps:**
  1. Sign up at OpenWeather → get API key.
  2. Call e.g.:
     ```text
     https://api.openweathermap.org/data/3.0/onecall?lat=45.5&lon=-73.6&exclude=minutely&appid=YOUR_API_KEY
     ```
- **Use:**
  - Get current/forecast temperatures.
  - In scenario engine, increase or decrease `heat_stress` based on heatwave assumptions.

---

### 6.3 Noise – Mesures de niveaux acoustiques

- **Dataset:** Mesures de niveaux acoustiques
- **URL:** `https://donnees.montreal.ca/dataset/mesures-niveaux-acoustiques`
- **Type:** CSV
- **Access:**
  - Download CSV resource.
- **ETL Use:**
  - For each measurement point, derive a dB level (e.g., Leq).
  - Map points to nearest grid cell.
  - Normalize to `noise_stress` (0–1).

---

### 6.4 Traffic – Entraves, Segments & Travel Times

#### 6.4.1 Entraves à la circulation (Real-time)

- **Dataset:** Entraves à la circulation
- **URLs:**
  - Montréal: `https://donnees.montreal.ca/dataset/entraves-circulation`
  - Données Québec: `https://www.donneesquebec.ca/recherche/dataset/vmtl-entraves-circulation`
- **Type:** JSON/XML feed
- **Access:**
  - Use the JSON resource URL with `requests.get()`, parse as JSON.
- **ETL / Runtime Use:**
  - For each active closure, mark overlapping segments/cells and bump their `traffic_stress`.

#### 6.4.2 Segments & Travel Times

- **Segments dataset:**  
  `https://donnees.montreal.ca/dataset/segments-routiers-de-collecte-des-temps-de-parcours`
- **Travel times dataset:**  
  `https://donnees.montreal.ca/dataset/temps-de-parcours-sur-des-segments-routiers-historique`
- **Type:** CSV (+ geometry for segments)
- **Access:**
  - Download CSVs and geometry (GeoJSON or SHP if available).
- **ETL Use:**
  - Join travel time measurements with segments.
  - Derive congestion index per segment (travel time vs free-flow).
  - Aggregate to grid ⇒ `traffic_stress`.

---

### 6.5 Transit – STM GTFS Static + Realtime (optional)

- **Developer portal:** `https://www.stm.info/en/about/developers`
- **API hub:** `https://portail.developpeurs.stm.info/apihub`
- **GTFS Static:**
  - Download `gtfs.zip` from STM’s open data.
- **GTFS Realtime:**
  - After registering, get GTFS-RT URLs plus API key.
- **ETL Use (Static):**
  - Parse stops, routes, and frequencies:
    - Compute “frequent transit” threshold (e.g., headway ≤ 10–15 min).
    - For each cell, distance to nearest frequent stop → transit access score.
- **Runtime Use (optional):**
  - Use GTFS-RT to detect delayed/overloaded routes and increase `crowding_stress` around affected nodes.

---

### 6.6 Trees, Planting Sites & Canopy

#### 6.6.1 Arbres publics

- **Dataset:** Arbres publics sur le territoire de la Ville
- **URL:** `https://donnees.montreal.ca/dataset/arbres`
- **Type:** CSV
- **Access:**
  - Download CSV with tree locations and attributes.
- **ETL Use:**
  - Spatially join to grid cells to estimate tree density (or canopy proxy).

#### 6.6.2 Emplacements de plantation d’arbres publics

- **Dataset:** Emplacements de plantation d’arbres publics
- **URLs:**
  - Montréal: `https://donnees.montreal.ca/dataset/emplacements-arbres`
  - Données Québec: `https://www.donneesquebec.ca/recherche/dataset/vmtl-emplacements-arbres`
- **Type:** CSV
- **Access:**
  - Download CSV from resources.
- **ETL Use:**
  - Map planting site points into grid cells.
  - Constraint: tree interventions only where planting is possible.

#### 6.6.3 Canopée

- **Dataset:** Canopée
- **URL:** `https://donnees.montreal.ca/dataset/canopee`
- **Type:** GeoJSON/SHP/TIFF
- **Access:**
  - Download geometry and load with GeoPandas.
- **ETL Use:**
  - Compute `canopy_i` per cell (tree cover fraction).

---

### 6.7 Vulnerability & Equity

#### 6.7.1 Vulnérabilité aux changements climatiques

- **Dataset:** Vulnérabilité aux changements climatiques
- **URL:** `https://donnees.montreal.ca/dataset/vulnerabilite-changements-climatiques`
- **Type:** ZIP (grid shapes + attributes)
- **Access:**
  1. Download “mailles” resource ZIP.
  2. Unzip and load the grid layer.
- **ETL Use:**
  - Intersect vulnerability grid with our CSI grid.
  - Extract vulnerability index per cell.

#### 6.7.2 Statistics Canada 2021 Census – Web Data Service

- **Docs:**
  - Overview: `https://www.statcan.gc.ca/en/developers/wds`
  - 2021 Census Profile WDS: `https://www12.statcan.gc.ca/wds-sdw/2021profile-profil2021-eng.cfm`
- **Access:**
  - Use HTTP GET with geographic codes for Montréal (CT/DA) and requested variables.
- **ETL Use:**
  - Retrieve:
    - Population density.
    - Children (0–14) & seniors (65+).
    - Median income / low-income measures.
  - Build `vulnerability_factor` (e.g., combine socio-economic + climate vulnerability).

---

## 7. System Architecture

### 7.1 High-Level Diagram (conceptual)

- **Client (Next.js + MapLibre + deck.gl)**  
  ↕ REST / JSON
- **Flask API**  
  ↕ Files/APIs
- **Data Sources (CSV/GeoJSON + external APIs)**

### 7.2 Backend (Flask)

#### 7.2.1 Components

- **ETL pipeline (offline script)**

  - `etl/download_datasets.py`
  - `etl/build_grid.py` (grid and intersections)
  - `etl/compute_features.py` (stress components, vulnerability)
  - `etl/compute_interventions.py` (scores and priorities)
  - Output: `data/processed/citypulse_grid.geojson` or `citypulse_grid.parquet`

- **API service**
  - `app.py` (Flask entrypoint)
  - Loads preprocessed grid and exposes endpoints.

#### 7.2.2 Core endpoints

**GET `/api/grid`**

- Query params:
  - `scenario` = `current` (default) or `2035`
  - Optional: `car`, `trees`, `transit` (scenario adjustments)
- Response (GeoJSON FeatureCollection):
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "Polygon", "coordinates": [...] },
        "properties": {
          "id": "cell_123",
          "csi_current": 72,
          "csi_scenario": 45,
          "air_stress": 0.8,
          "heat_stress": 0.7,
          "noise_stress": 0.6,
          "traffic_stress": 0.85,
          "crowding_stress": 0.4,
          "vulnerability_factor": 0.9,
          "is_hotspot": true
        }
      }
    ]
  }
  GET /api/hotspots
  ```

Response:

json
Copy code
[
{
"id": "hotspot_1",
"centroid": { "lat": 45.53, "lng": -73.56 },
"avg_csi": 80,
"top_drivers": ["traffic", "air"],
"avg_vulnerability": 0.85,
"cell_ids": ["cell_123", "cell_124"]
}
]
GET /api/trees

Response: GeoJSON points of existing trees with attributes.

GET /api/planting-sites

Response: GeoJSON points of feasible planting locations with priority_score if precomputed.

GET /api/cell/<id>

Response:

json
Copy code
{
"id": "cell_123",
"metrics": {
"csi_current": 72,
"csi_scenario": 45,
"air_stress": 0.8,
"heat_stress": 0.7,
"noise_stress": 0.6,
"traffic_stress": 0.85,
"crowding_stress": 0.4,
"vulnerability_factor": 0.9
},
"interventions": {
"trees": {
"score": 0.92,
"recommended_count": 25,
"expected_delta_csi": -18
},
"car_limits": {
"type": "school_street",
"score": 0.88,
"expected_delta_csi": -15
},
"transit": {
"type": "new_stop",
"score": 0.75,
"expected_delta_csi": -10
}
},
"summary": {
"short": "High traffic and air pollution near a school. Trees and a school street could cut stress by ~30%.",
"source": "groq"
}
}
POST /api/scenario/summary (optional)

Request:

json
Copy code
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
Response:

json
Copy code
{
"narrative": "By 2035, with a 30% drop in car dependence and aggressive greening, average city stress falls from 60 to 40..."
}
7.3 Frontend (Next.js + MapLibre + deck.gl + Tailwind)
7.3.1 Pages & Components
pages/index.tsx

Layout: header (title + theme), map container, right-side panel.

components/CityPulseMap.tsx

Initializes MapLibre map.

Integrates <DeckGL> overlay (viewState synced).

components/CityStressLayers.tsx

Fetches data (/api/grid, /api/trees, /api/planting-sites, etc.).

Creates deck.gl layers (GeoJsonLayer, ScatterplotLayer, etc.).

components/CellDetailsPanel.tsx

Shows metrics + interventions + summary text.

components/ScenarioControls.tsx

Sliders/switches for car, transit, trees.

components/LayerToggles.tsx

Toggles for CSI grid, trees, traffic, vulnerability.

7.3.2 State Management
Use React state + hooks, optionally with React Query/SWR:

selectedCellId

scenarioParams (car, trees, transit)

visibleLayers

gridData, treesData, etc.

7.4 AI Integration (Groq & Gemini)
7.4.1 Groq (cell-level summaries)
Endpoint: https://api.groq.com/openai/v1/chat/completions

Usage:

In /api/cell/<id>:

Construct a short system prompt describing role: “You’re a city planning assistant in 2035…”

Provide cell metrics & interventions in JSON.

Request a short (2–4 sentence) explanation.

Cache responses by cell ID (in-memory dict for hackathon) to avoid repeated calls.

7.4.2 Gemini (scenario narratives)
Docs: https://ai.google.dev/gemini-api/docs/quickstart

Usage:

In /api/scenario/summary:

Provide aggregate metrics and key hotspots/changes.

Request a concise narrative (<400–600 tokens).

Limit calls (e.g., 1 per scenario adjustment or only on explicit button click).
