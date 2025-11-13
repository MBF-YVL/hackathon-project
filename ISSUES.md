# Issues and Improvements

## Current Status
✅ Backend API running on port 5001
✅ Frontend running on port 3000
✅ All 9 datasets processed successfully
✅ 21,574 grid cells with real data
✅ API endpoints working correctly

## Critical Issues

### 1. Data Processing
- **Traffic Segments**: Currently using simplified distance-based computation in `compute_features.py:248-261`
  - Real traffic segment data exists (`traffic_segments.csv`) but is not being used for spatial analysis
  - Need to implement proper spatial join between grid cells and traffic segments
  - Should compute traffic stress based on actual segment proximity/density

### 2. API Integration
- **Missing API Keys**: The `.env` file exists but may have placeholder values
  - Groq API (for cell summaries) - `GROQ_API_KEY`
  - Google Gemini (for scenario narratives) - `GEMINI_API_KEY`
  - OpenWeather (optional) - `OPENWEATHER_API_KEY`
  - Backend will return fallback messages without these keys

### 3. Frontend Issues
- **Trees Layer**: May be loading 17MB file (`trees.geojson`)
  - Should implement pagination, clustering, or zoom-based filtering
  - Currently rendering individual points which may be slow
  
- **Error Message**: Fixed to show correct port (5001) ✅

### 4. Data Quality
- **Travel Times Data**: File exists (`travel_times.csv`) but not being used in ETL pipeline
  - Should integrate with traffic stress computation
  - Could provide more accurate congestion patterns

- **Real-time Traffic Closures**: API endpoint in `data_loader.py` tries multiple URLs
  - May need verification that the endpoint is still working
  - Fallback logic exists but should be tested

### 5. Performance
- **Large GeoJSON Files**:
  - `trees.geojson`: 17MB (simulated data)
  - `citypulse_grid.geojson`: 17MB (all grid cells)
  - Should consider:
    - Viewport-based loading
    - Simplification/decimation
    - Binary formats (Parquet, FlatGeobuf)

- **AI Response Times**:
  - No caching implemented yet for Groq/Gemini responses
  - Should add in-memory or Redis cache

### 6. Missing Features (from PRD)
- **Scenario Engine**: Basic implementation exists but not fully tested
  - Car limit scenarios (`scenario_engine.py:19-28`)
  - Tree investment scenarios (`scenario_engine.py:29-39`)
  - Transit scenarios (`scenario_engine.py:40-49`)
  - Need to verify CSI updates properly reflect user slider changes

- **Cell Details AI Summary**: Endpoint exists (`/api/cell/<id>`) but needs API key
  - Returns formatted details but Groq summary will be "No summary available" without key

- **Scenario Narrative Generation**: Endpoint exists (`/api/scenario/summary`) but needs API key
  - Will return error without Gemini key

### 7. Development Environment
- **Setup Documentation**: `SETUP_GUIDE.md` exists and is comprehensive ✅
- **Running Processes**: Both backend and frontend are running ✅

## Non-Critical Improvements

### UX Enhancements
1. **Loading States**: Add skeleton loaders for map and panels
2. **Error Boundaries**: Better error handling for component failures
3. **Tooltips**: More informative hover states for layers
4. **Legend**: Dynamic legend based on active layers
5. **Mobile Responsiveness**: Currently desktop-focused

### Data Visualization
1. **3D Mode**: Add pitch/bearing controls for 3D view
2. **Time-based Animation**: Animate scenario transitions
3. **Comparison Mode**: Side-by-side current vs 2035
4. **Heatmap Alternative**: Option for continuous heatmap vs grid cells

### Analytics
1. **Aggregate Statistics**: City-wide CSI dashboard
2. **Trend Charts**: Show how interventions affect CSI over space
3. **Export**: Allow users to download filtered data

### Code Quality
1. **Type Safety**: Some `any` types in TypeScript components
2. **Error Handling**: More granular try-catch blocks
3. **Testing**: No tests implemented yet
4. **Linting**: Run ESLint and fix warnings

## Recommended Next Steps

### Immediate (High Priority)
1. ✅ Fix frontend error message port
2. **Add API keys** to `.env` file or test without them
3. **Test scenario sliders** to ensure CSI updates correctly
4. **Verify traffic segments integration** or document as limitation
5. **Test trees layer rendering** at different zoom levels

### Short-term (Medium Priority)
6. Optimize trees.geojson loading (clustering or viewport filtering)
7. Implement basic caching for AI responses
8. Add loading indicators for AI-generated content
9. Test all API endpoints with curl/Postman
10. Document known limitations in README

### Long-term (Low Priority)
11. Refactor traffic stress computation to use real segments
12. Integrate travel_times.csv data
13. Add automated tests for API endpoints
14. Implement viewport-based data loading
15. Add comparison/animation features

## Files to Review

### Backend
- `backend/etl/compute_features.py` - Traffic stress computation (lines 248-261)
- `backend/etl/data_loader.py` - Traffic segments loading (lines 144-170)
- `backend/scenario_engine.py` - Scenario adjustments
- `backend/ai_services.py` - API key validation
- `backend/.env` - API keys (not in git)

### Frontend
- `frontend/components/CityPulseMap.tsx` - Trees layer rendering (lines 108-124)
- `frontend/app/page.tsx` - Error handling and loading states
- `frontend/lib/api.ts` - API client configuration

### Data
- `backend/data/raw/traffic_segments.csv` - Unused in spatial analysis
- `backend/data/raw/travel_times.csv` - Not integrated yet
- `backend/data/processed/trees.geojson` - 17MB simulated data

## Testing Checklist

### API Endpoints
- [ ] `GET /api/grid` - Returns valid GeoJSON
- [ ] `GET /api/grid?scenario=2035&car=-0.3&trees=0.5&transit=0.4` - Returns modified CSI
- [ ] `GET /api/trees` - Returns valid GeoJSON
- [ ] `GET /api/planting-sites` - Returns valid GeoJSON
- [ ] `GET /api/cell/cell_1` - Returns cell details
- [ ] `POST /api/scenario/summary` - Returns narrative (needs Gemini key)
- [ ] `GET /api/hotspots` - Returns high CSI cells

### Frontend Features
- [ ] Map loads and centers on Montréal
- [ ] Grid cells render with CSI colors
- [ ] Clicking cell opens details panel
- [ ] Layer toggles work (CSI, trees, planting, hotspots)
- [ ] Scenario sliders update map
- [ ] Generate narrative button triggers API call
- [ ] Error states display correctly
- [ ] Loading states display correctly

### Data Quality
- [ ] CSI values are reasonable (0-100 range)
- [ ] All grid cells have valid geometries
- [ ] No NaN or null values in critical fields
- [ ] Intervention scores are computed
- [ ] Tree counts and planting sites are reasonable

## Notes
- This is a hackathon prototype - prioritize working features over perfection
- The data pipeline is complex and some fallbacks are intentional
- API keys are optional for basic functionality
- The frontend should work even if backend AI features fail gracefully

