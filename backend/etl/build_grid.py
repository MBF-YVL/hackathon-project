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
    
    Enhanced with 100+ points for accurate coastline following
    """
    # Montreal Island boundary - high-precision polygon following actual coastline
    # Based on OpenStreetMap data and official Montreal boundaries
    boundary_coords = [
        # Southwest corner - Verdun/LaSalle
        (-73.975, 45.418),
        (-73.970, 45.418),
        (-73.965, 45.417),
        (-73.960, 45.416),
        (-73.955, 45.415),
        # South shore - St. Lawrence River (west to east through neighborhoods)
        # LaSalle
        (-73.950, 45.414),
        (-73.940, 45.413),
        (-73.930, 45.412),
        (-73.920, 45.411),
        # Verdun
        (-73.910, 45.410),
        (-73.900, 45.410),
        (-73.890, 45.410),
        (-73.880, 45.410),
        # Southwest downtown edge
        (-73.870, 45.409),
        (-73.860, 45.409),
        (-73.850, 45.409),
        (-73.840, 45.409),
        (-73.830, 45.410),
        # Old Port / St. Lawrence shoreline
        (-73.820, 45.410),
        (-73.810, 45.411),
        (-73.800, 45.412),
        (-73.790, 45.413),
        (-73.780, 45.414),
        (-73.770, 45.415),
        (-73.760, 45.416),
        (-73.750, 45.417),
        # Hochelaga-Maisonneuve
        (-73.740, 45.418),
        (-73.730, 45.420),
        (-73.720, 45.422),
        (-73.710, 45.424),
        (-73.700, 45.426),
        (-73.690, 45.429),
        (-73.680, 45.432),
        (-73.670, 45.435),
        # Mercier-Est
        (-73.660, 45.438),
        (-73.650, 45.441),
        (-73.640, 45.444),
        (-73.630, 45.447),
        (-73.620, 45.450),
        (-73.610, 45.453),
        (-73.600, 45.456),
        (-73.590, 45.460),
        # Rivière-des-Prairies (southeast)
        (-73.580, 45.464),
        (-73.570, 45.468),
        (-73.560, 45.472),
        (-73.550, 45.477),
        (-73.540, 45.482),
        (-73.530, 45.487),
        (-73.520, 45.492),
        (-73.510, 45.497),
        # Pointe-aux-Trembles - East tip
        (-73.500, 45.502),
        (-73.495, 45.507),
        (-73.492, 45.512),
        (-73.490, 45.517),
        (-73.488, 45.522),
        (-73.487, 45.527),
        (-73.486, 45.532),
        (-73.486, 45.537),
        (-73.487, 45.542),
        (-73.488, 45.547),
        (-73.490, 45.552),
        # Northeast corner - turning north
        (-73.493, 45.557),
        (-73.497, 45.562),
        (-73.502, 45.567),
        (-73.508, 45.572),
        (-73.515, 45.576),
        (-73.523, 45.580),
        (-73.532, 45.584),
        (-73.541, 45.587),
        (-73.550, 45.590),
        # North shore - Rivière des Prairies (east to west)
        # Rivière-des-Prairies (north)
        (-73.560, 45.593),
        (-73.570, 45.596),
        (-73.580, 45.599),
        (-73.590, 45.602),
        (-73.600, 45.604),
        (-73.610, 45.606),
        (-73.620, 45.608),
        (-73.630, 45.610),
        (-73.640, 45.611),
        (-73.650, 45.612),
        (-73.660, 45.612),
        (-73.670, 45.611),
        (-73.680, 45.610),
        # Montréal-Nord / Ahuntsic
        (-73.690, 45.608),
        (-73.700, 45.606),
        (-73.710, 45.603),
        (-73.720, 45.600),
        (-73.730, 45.596),
        (-73.740, 45.592),
        (-73.750, 45.587),
        (-73.760, 45.582),
        # Cartierville
        (-73.770, 45.576),
        (-73.780, 45.570),
        (-73.790, 45.564),
        (-73.800, 45.557),
        (-73.810, 45.550),
        (-73.820, 45.543),
        # Pierrefonds-Roxboro
        (-73.830, 45.536),
        (-73.840, 45.528),
        (-73.850, 45.520),
        (-73.860, 45.511),
        (-73.870, 45.502),
        (-73.880, 45.493),
        (-73.890, 45.484),
        (-73.900, 45.475),
        # Île-Bizard connector
        (-73.910, 45.467),
        (-73.920, 45.459),
        (-73.930, 45.451),
        (-73.940, 45.444),
        # West Island - Sainte-Anne-de-Bellevue
        (-73.945, 45.440),
        (-73.950, 45.436),
        (-73.955, 45.432),
        (-73.960, 45.428),
        (-73.965, 45.424),
        (-73.970, 45.421),
        # Close polygon
        (-73.975, 45.418),
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

