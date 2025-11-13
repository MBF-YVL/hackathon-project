# CityPulse Montréal 2035 - Quick Start Guide

## 🚀 System Status: OPERATIONAL

### Backend API
- **Status:** ✅ Running on http://localhost:5001
- **Health:** http://localhost:5001/health
- **Process:** Background (PID in system)

### Frontend Web App
- **Status:** ✅ Running on http://localhost:3000
- **UI:** Next.js with MapLibre + deck.gl
- **Process:** Background (dev server)

## 📊 Data Summary

All 9 Montreal open datasets successfully processed:

| Dataset | Records | Status |
|---------|---------|--------|
| Air Quality (RSQA) | 96,361 measurements | ✅ |
| Heat Islands | 5 zones | ✅ |
| Noise Levels | 551,402 measurements | ✅ |
| Traffic Segments | 331 segments | ✅ |
| Travel Times | Real-time | ✅ |
| Public Trees | 107,870 locations | ✅ |
| Planting Sites | 100 priority sites | ✅ |
| Tree Canopy | 514,124 polygons | ✅ |
| Vulnerability | 799,824 zones | ✅ |

**Grid:** 21,574 hexagonal cells covering Montreal
**CSI Range:** 24.9 - 62.5 (mean: 42.6)

## 🔧 Control Commands

### Start/Stop Backend
```bash
cd backend
source venv/bin/activate

# Start
PORT=5001 python app.py

# Stop (if needed)
lsof -ti:5001 | xargs kill -9
```

### Start/Stop Frontend
```bash
cd frontend

# Start
npm run dev

# Stop
# Ctrl+C or:
lsof -ti:3000 | xargs kill -9
```

### Re-run ETL Pipeline
```bash
cd backend
source venv/bin/activate

# Full pipeline
python etl/build_grid.py
python etl/compute_features.py
python etl/compute_interventions.py

# Check data
python -c "from etl.data_loader import check_data_availability; check_data_availability()"
```

## 🧪 API Testing

```bash
# Health check
curl http://localhost:5001/health

# Get grid data (21K+ cells)
curl http://localhost:5001/api/grid | jq '.features | length'

# Get trees (107K+ locations)
curl http://localhost:5001/api/trees | jq '.features | length'

# Get planting sites (100 sites)
curl http://localhost:5001/api/planting-sites | jq '.features | length'

# Get hotspots
curl http://localhost:5001/api/hotspots | jq '.'

# Get cell details
curl http://localhost:5001/api/cell/cell_1000 | jq '.'
```

## 🎨 Frontend Features

Visit http://localhost:3000 to see:

- **Interactive Map** - Montreal with CSI heatmap
- **Scenario Controls** - Adjust 2035 interventions
  - Car dependence reduction (-100% to 0%)
  - Tree investment (0% to 100%)
  - Transit expansion (0% to 100%)
- **Layer Toggles** - Trees, planting sites, vulnerability
- **Cell Details** - Click any cell for AI-powered analysis
- **AI Narratives** - Gemini-generated scenario summaries

## 🔐 Environment Variables (Optional)

For AI features, create `backend/.env`:

```bash
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
```

Without these, the app works but AI summaries will be disabled.

## 📁 Key Files

- `backend/data/processed/citypulse_grid.geojson` - Main grid (17MB)
- `backend/data/processed/trees.geojson` - Tree locations (3MB)
- `backend/data/processed/planting_sites.geojson` - Priority sites (5KB)
- `backend/data/raw/` - Original datasets (1.7GB total)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -ti:5001

# Kill the process
lsof -ti:5001 | xargs kill -9
```

### Backend Not Responding
```bash
# Check logs
tail -f /tmp/citypulse_backend.log

# Restart
cd backend
source venv/bin/activate
PORT=5001 python app.py
```

### Frontend Not Loading Map
1. Check browser console (F12)
2. Verify backend is running: `curl http://localhost:5001/health`
3. Check CORS is enabled (should be by default)
4. Clear browser cache and reload

### Missing Data
```bash
cd backend
source venv/bin/activate
python -c "from etl.data_loader import check_data_availability; check_data_availability()"
```

## 🎯 Next Steps for Demo

1. **Open http://localhost:3000** in browser
2. **Wait for map to load** (21K+ cells, may take 5-10 seconds)
3. **Try scenario controls** - See CSI change in real-time
4. **Click cells** - View detailed stress breakdown
5. **Toggle layers** - See trees, planting sites, vulnerability
6. **Generate narrative** - Click "Generate Scenario Summary"

## 📝 Notes

- Grid computation takes ~30 seconds (already done)
- Feature computation takes ~2 minutes (already done)
- Map rendering may be slow with 21K+ polygons (this is normal)
- Consider aggregating/simplifying for production deployment

---

**Status as of:** November 13, 2024
**Git Branch:** main
**Latest Commit:** Update frontend API port to 5001

