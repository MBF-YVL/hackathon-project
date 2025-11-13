# Mapping Layer Issues & Fixes

## Issues Identified

### 1. Frontend Stuck on Loading Screen
- Page shows "Loading CityPulse Montréal 2035" indefinitely
- Data is not being fetched from backend or failing silently

### 2. Potential Causes
- CORS issues between frontend (port 3000) and backend (port 5001)
- API client not handling errors properly
- MapLibre/deck.gl initialization issues
- GeoJSON data format issues

## Fixes to Implement

### Fix 1: Improve Error Handling in API Client
Add better error logging and CORS headers

### Fix 2: Simplify Map Rendering
- Remove complex sampling logic that might be causing issues
- Ensure proper data validation before rendering

### Fix 3: Add Debug Logging
- Log when data is loaded
- Log any errors that occur
- Show error state in UI

### Fix 4: Fix Layer Opacity and Visibility
- Ensure layers are actually visible
- Adjust colors for better visibility
- Fix fill opacity issues

