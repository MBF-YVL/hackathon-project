"""
Build Montreal Grid
Creates a 250m x 250m grid covering Montréal and Laval (clipped to exact city boundaries)
"""
import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
import os
from pathlib import Path

# Grid cell size in degrees (approximately 250m at Montreal's latitude)
# At 45.5°N: 1° longitude ≈ 78.8 km, 1° latitude ≈ 111.2 km
# 250m ≈ 0.00317° longitude, 0.00225° latitude
CELL_SIZE_LON = 0.00317
CELL_SIZE_LAT = 0.00225

def get_montreal_laval_boundary():
    """
    Get combined boundary for Montreal agglomeration and (optionally) Laval.
    If Laval boundary data is unavailable, fall back to Montreal-only boundary to
    avoid rendering inaccurate rectangular coverage.
    """
    data_dir = Path(__file__).parent.parent / 'data' / 'raw'
    montreal_file = data_dir / 'montreal_boundary.geojson'
    laval_file = data_dir / 'laval_boundary.geojson'
    
    montreal_boundary = None
    if montreal_file.exists():
        try:
            gdf = gpd.read_file(montreal_file)
            print(f"    Loaded {len(gdf)} Montreal administrative polygons")
            montreal_boundary = unary_union(gdf.geometry)
        except Exception as e:
            print(f"    Error loading Montreal boundary: {e}")
    
    if montreal_boundary is None:
        raise FileNotFoundError(
            "Unable to load Montreal boundary (expected data/raw/montreal_boundary.geojson)"
        )
    
    combined_boundary = montreal_boundary
    
    if laval_file.exists():
        try:
            laval_gdf = gpd.read_file(laval_file)
            laval_boundary = unary_union(laval_gdf.geometry)
            combined_boundary = unary_union([montreal_boundary, laval_boundary])
            print("    Laval boundary detected and merged with Montreal boundary")
        except Exception as e:
            print(f"    Error loading Laval boundary ({e}). Proceeding with Montreal only.")
    else:
        print("    Laval boundary file not found; focusing on Montreal coverage only")
    
    if not combined_boundary.is_valid:
        combined_boundary = combined_boundary.buffer(0)
    
    print(f"    Project boundary area: {combined_boundary.area:.4f} sq degrees")
    return combined_boundary

def create_grid():
    """Create a square grid covering Montréal and Laval, clipped to exact boundaries"""
    print("Creating Montreal+Laval grid...")
    
    # Get combined Montreal+Laval boundary
    boundary = get_montreal_laval_boundary()
    
    # Get bounding box for grid generation
    bounds = boundary.bounds  # (minx, miny, maxx, maxy)
    min_lon, min_lat, max_lon, max_lat = bounds
    
    print(f"Boundary bounds: lon [{min_lon:.4f}, {max_lon:.4f}], lat [{min_lat:.4f}, {max_lat:.4f}]")
    
    cells = []
    cell_id = 1
    
    lon = min_lon
    while lon < max_lon:
        lat = min_lat
        while lat < max_lat:
            # Create cell polygon
            cell = Polygon([
                (lon, lat),
                (lon + CELL_SIZE_LON, lat),
                (lon + CELL_SIZE_LON, lat + CELL_SIZE_LAT),
                (lon, lat + CELL_SIZE_LAT),
                (lon, lat)
            ])
            
            # Only include cells that intersect the boundary (not just bounding box)
            if cell.intersects(boundary):
                # Clip cell to boundary for exact coverage
                clipped_cell = cell.intersection(boundary)
                if not clipped_cell.is_empty and clipped_cell.area > 0:
                    cells.append({
                        'id': f'cell_{cell_id}',
                        'geometry': clipped_cell
                    })
                    cell_id += 1
            
            lat += CELL_SIZE_LAT
        lon += CELL_SIZE_LON
    
    print(f"Created {len(cells)} grid cells (clipped to exact Montreal+Laval boundaries)")
    
    gdf = gpd.GeoDataFrame(cells, crs='EPSG:4326')
    
    gdf['air_stress'] = 0.5
    gdf['heat_stress'] = 0.5
    gdf['noise_stress'] = 0.5
    gdf['traffic_stress'] = 0.5
    gdf['crowding_stress'] = 0.5
    gdf['vulnerability_factor'] = 1.0
    gdf['canopy'] = 0.3
    
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
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
    os.makedirs(output_dir, exist_ok=True)
    
    grid = create_grid()
    
    output_path = os.path.join(output_dir, 'montreal_grid.geojson')
    save_grid(grid, output_path)
    
    final_path = os.path.join(output_dir, 'citypulse_grid.geojson')
    save_grid(grid, final_path)
    
    print("Grid creation complete!")
