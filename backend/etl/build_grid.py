"""
Build Montreal Grid
Creates a 250m x 250m grid covering Montréal
"""
import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon
import os

# Montreal bounding box (approximate)
MONTREAL_BOUNDS = {
    'min_lat': 45.40,
    'max_lat': 45.70,
    'min_lon': -73.98,
    'max_lon': -73.47
}

# Grid cell size in degrees (approximately 250m at Montreal's latitude)
# At 45.5°N: 1° longitude ≈ 78.8 km, 1° latitude ≈ 111.2 km
# 250m ≈ 0.00317° longitude, 0.00225° latitude
CELL_SIZE_LON = 0.00317
CELL_SIZE_LAT = 0.00225

def create_grid():
    """Create a square grid covering Montréal"""
    print("Creating Montreal grid...")
    
    # Generate grid cells
    cells = []
    cell_id = 1
    
    lon = MONTREAL_BOUNDS['min_lon']
    while lon < MONTREAL_BOUNDS['max_lon']:
        lat = MONTREAL_BOUNDS['min_lat']
        while lat < MONTREAL_BOUNDS['max_lat']:
            # Create cell polygon
            cell = Polygon([
                (lon, lat),
                (lon + CELL_SIZE_LON, lat),
                (lon + CELL_SIZE_LON, lat + CELL_SIZE_LAT),
                (lon, lat + CELL_SIZE_LAT),
                (lon, lat)
            ])
            
            cells.append({
                'id': f'cell_{cell_id}',
                'geometry': cell
            })
            
            cell_id += 1
            lat += CELL_SIZE_LAT
        
        lon += CELL_SIZE_LON
    
    print(f"Created {len(cells)} grid cells")
    
    # Create GeoDataFrame
    gdf = gpd.GeoDataFrame(cells, crs='EPSG:4326')
    
    # Initialize default stress values (will be computed later)
    gdf['air_stress'] = 0.5
    gdf['heat_stress'] = 0.5
    gdf['noise_stress'] = 0.5
    gdf['traffic_stress'] = 0.5
    gdf['crowding_stress'] = 0.5
    gdf['vulnerability_factor'] = 1.0
    gdf['canopy'] = 0.3
    
    # Compute initial CSI
    weights = {'air': 0.20, 'heat': 0.25, 'noise': 0.15, 'traffic': 0.25, 'crowding': 0.15}
    base_csi = (
        weights['air'] * gdf['air_stress'] +
        weights['heat'] * gdf['heat_stress'] +
        weights['noise'] * gdf['noise_stress'] +
        weights['traffic'] * gdf['traffic_stress'] +
        weights['crowding'] * gdf['crowding_stress']
    ) * 100
    
    gdf['csi_current'] = (base_csi * (0.5 + 0.5 * gdf['vulnerability_factor'])).clip(0, 100)
    gdf['csi_scenario'] = gdf['csi_current']
    
    # Initialize intervention scores (will be computed later)
    gdf['tree_score'] = 0.0
    gdf['tree_count'] = 0
    gdf['tree_delta_csi'] = 0
    gdf['car_limit_score'] = 0.0
    gdf['car_limit_type'] = 'none'
    gdf['car_limit_delta_csi'] = 0
    gdf['transit_score'] = 0.0
    gdf['transit_type'] = 'none'
    gdf['transit_delta_csi'] = 0
    
    return gdf

def save_grid(gdf, output_path):
    """Save grid to GeoJSON"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    gdf.to_file(output_path, driver='GeoJSON')
    print(f"Grid saved to {output_path}")

if __name__ == '__main__':
    # Create output directory
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
    os.makedirs(output_dir, exist_ok=True)
    
    # Build grid
    grid = create_grid()
    
    # Save to file
    output_path = os.path.join(output_dir, 'montreal_grid.geojson')
    save_grid(grid, output_path)
    
    # Also save as citypulse_grid.geojson (final output name)
    final_path = os.path.join(output_dir, 'citypulse_grid.geojson')
    save_grid(grid, final_path)
    
    print("Grid creation complete!")

