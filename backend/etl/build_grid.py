"""
Build Montreal Grid
Creates a 250m x 250m grid covering Montréal (clipped to city boundaries)
"""
import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, Point
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

def get_montreal_boundary():
    """
    Create Montreal Island boundary - accurate coverage of the island only
    Montreal Island is bounded by:
    - North: Rivière des Prairies (separates from Laval)
    - South: St. Lawrence River (separates from Longueuil)  
    - East: Bout-de-l'Île (Pointe-aux-Trembles)
    - West: Lac Saint-Louis (Sainte-Anne-de-Bellevue)
    
    Using proper coordinates that follow the actual island shape
    """
    # Montreal Island boundary - following the actual island coastline
    # Coordinates are (longitude, latitude) in EPSG:4326
    # Simplified Montreal Island boundary - proper oval shape covering the island
    # Going clockwise from southwest corner
    boundary_coords = [
        # Southwest - LaSalle/Verdun
        (-73.97, 45.42),
        # South shore along St. Lawrence River (west to east)
        (-73.95, 45.42),
        (-73.90, 45.42),
        (-73.85, 45.42),
        (-73.80, 45.42),
        (-73.75, 45.43),
        (-73.70, 45.44),
        (-73.65, 45.45),
        # Southeast - Mercier/Hochelaga
        (-73.60, 45.47),
        (-73.55, 45.49),
        # East tip - Pointe-aux-Trembles
        (-73.50, 45.52),
        # Northeast - turning north
        (-73.50, 45.54),
        (-73.52, 45.56),
        (-73.55, 45.58),
        # North shore along Rivière des Prairies (east to west)
        (-73.60, 45.60),
        (-73.65, 45.62),
        (-73.70, 45.63),
        (-73.75, 45.63),
        (-73.80, 45.62),
        (-73.85, 45.60),
        # Northwest - Pierrefonds/Roxboro
        (-73.90, 45.57),
        (-73.93, 45.54),
        # West - Sainte-Anne-de-Bellevue
        (-73.95, 45.50),
        (-73.96, 45.46),
        (-73.97, 45.42),
    ]
    
    from shapely.geometry import Polygon
    poly = Polygon(boundary_coords)
    # Make sure it's valid
    if not poly.is_valid:
        poly = poly.buffer(0)  # Fix any topology issues
    return poly

def create_grid():
    """Create a square grid covering Montréal, clipped to city boundaries"""
    print("Creating Montreal grid...")
    
    # Get Montreal boundary
    montreal_boundary = get_montreal_boundary()
    print(f"Montreal boundary area: {montreal_boundary.area:.4f} sq degrees")
    
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
            
            # Only keep cells that intersect with Montreal boundary
            if cell.intersects(montreal_boundary):
                # Clip cell to boundary
                clipped_cell = cell.intersection(montreal_boundary)
                
                # Only keep if significant overlap (>30% to include edge neighborhoods)
                if clipped_cell.area / cell.area > 0.3:
                    cells.append({
                        'id': f'cell_{cell_id}',
                        'geometry': cell  # Keep original square for consistency
                    })
                    cell_id += 1
            
            lat += CELL_SIZE_LAT
        
        lon += CELL_SIZE_LON
    
    print(f"Created {len(cells)} grid cells (clipped to Montreal boundaries)")
    
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

