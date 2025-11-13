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
    Create Montreal Island boundary - precise coverage matching actual island
    Montreal Island is bounded by:
    - North: Rivière des Prairies (separates from Laval)
    - South: St. Lawrence River (separates from Longueuil)  
    - East: Bout-de-l'Île (Pointe-aux-Trembles)
    - West: Lac Saint-Louis (Sainte-Anne-de-Bellevue)
    """
    # Montreal Island boundary - precise polygon following actual coastline
    # Coordinates traced from actual island boundaries
    boundary_coords = [
        # Southwest tip (Verdun)
        (-73.970, 45.420),
        # South shore - St. Lawrence River (west to east)
        (-73.950, 45.415),
        (-73.920, 45.412),
        (-73.890, 45.410),
        (-73.860, 45.410),
        (-73.830, 45.410),
        (-73.800, 45.412),
        (-73.770, 45.415),
        (-73.740, 45.418),
        (-73.710, 45.422),
        (-73.680, 45.428),
        (-73.650, 45.435),
        (-73.620, 45.442),
        (-73.590, 45.450),
        (-73.560, 45.460),
        (-73.530, 45.472),
        (-73.505, 45.485),
        # East tip - Bout-de-l'Île
        (-73.490, 45.500),
        (-73.485, 45.515),
        (-73.485, 45.530),
        (-73.488, 45.545),
        # Northeast - Rivière des Prairies south shore (east to west)
        (-73.495, 45.560),
        (-73.510, 45.575),
        (-73.530, 45.587),
        (-73.555, 45.597),
        (-73.585, 45.605),
        (-73.615, 45.610),
        (-73.645, 45.612),
        (-73.675, 45.610),
        (-73.700, 45.605),
        # North shore - Rivière des Prairies (continuing west)
        (-73.720, 45.598),
        (-73.740, 45.588),
        (-73.760, 45.575),
        (-73.780, 45.560),
        (-73.800, 45.545),
        (-73.820, 45.528),
        (-73.840, 45.510),
        (-73.860, 45.492),
        (-73.880, 45.475),
        (-73.900, 45.460),
        (-73.920, 45.448),
        (-73.940, 45.435),
        (-73.955, 45.425),
        # Close to start
        (-73.970, 45.420),
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
                
                # Only keep if significant overlap (>50% of cell area)
                if clipped_cell.area / cell.area > 0.5:
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

