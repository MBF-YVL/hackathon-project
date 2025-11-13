"""Build Montreal Grid - Creates a 250m x 250m grid covering Montréal"""
import geopandas as gpd
from shapely.geometry import Polygon
import os

MONTREAL_BOUNDS = {
    'min_lat': 45.38,
    'max_lat': 45.70,
    'min_lon': -73.98,
    'max_lon': -73.40
}

CELL_SIZE_LON = 0.00317
CELL_SIZE_LAT = 0.00225

def get_montreal_boundary():
    """Create Montreal Island boundary polygon"""
    boundary_coords = [
        (-73.975, 45.395),
        (-73.950, 45.390),
        (-73.920, 45.387),
        (-73.890, 45.385),
        (-73.860, 45.384),
        (-73.830, 45.384),
        (-73.800, 45.385),
        (-73.770, 45.387),
        (-73.740, 45.390),
        (-73.710, 45.394),
        (-73.680, 45.399),
        (-73.650, 45.405),
        (-73.620, 45.413),
        (-73.590, 45.422),
        (-73.560, 45.433),
        (-73.530, 45.445),
        (-73.505, 45.458),
        (-73.470, 45.475),
        (-73.450, 45.495),
        (-73.435, 45.515),
        (-73.425, 45.535),
        (-73.420, 45.555),
        (-73.420, 45.575),
        (-73.425, 45.595),
        (-73.435, 45.615),
        (-73.450, 45.630),
        (-73.470, 45.643),
        (-73.495, 45.652),
        (-73.525, 45.658),
        (-73.550, 45.662),
        (-73.580, 45.665),
        (-73.610, 45.667),
        (-73.640, 45.667),
        (-73.670, 45.665),
        (-73.700, 45.665),
        (-73.730, 45.662),
        (-73.760, 45.655),
        (-73.790, 45.645),
        (-73.820, 45.630),
        (-73.850, 45.610),
        (-73.880, 45.585),
        (-73.910, 45.560),
        (-73.930, 45.525),
        (-73.945, 45.505),
        (-73.955, 45.485),
        (-73.965, 45.465),
        (-73.970, 45.420),
        (-73.973, 45.407),
        (-73.975, 45.395),
    ]
    
    poly = Polygon(boundary_coords)
    if not poly.is_valid:
        poly = poly.buffer(0)
    return poly

def create_grid():
    """Create a square grid covering Montréal, clipped to city boundaries"""
    print("Creating Montreal grid...")
    
    montreal_boundary = get_montreal_boundary()
    print(f"Montreal boundary area: {montreal_boundary.area:.4f} sq degrees")
    
    cells = []
    cell_id = 1
    
    lon = MONTREAL_BOUNDS['min_lon']
    while lon < MONTREAL_BOUNDS['max_lon']:
        lat = MONTREAL_BOUNDS['min_lat']
        while lat < MONTREAL_BOUNDS['max_lat']:
            cell = Polygon([
                (lon, lat),
                (lon + CELL_SIZE_LON, lat),
                (lon + CELL_SIZE_LON, lat + CELL_SIZE_LAT),
                (lon, lat + CELL_SIZE_LAT),
                (lon, lat)
            ])
            
            if cell.intersects(montreal_boundary):
                clipped_cell = cell.intersection(montreal_boundary)
                if clipped_cell.area / cell.area > 0.3:
                    cells.append({
                        'id': f'cell_{cell_id}',
                        'geometry': cell
                    })
                    cell_id += 1
            
            lat += CELL_SIZE_LAT
        lon += CELL_SIZE_LON
    
    print(f"Created {len(cells)} grid cells (clipped to Montreal boundaries)")
    
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
