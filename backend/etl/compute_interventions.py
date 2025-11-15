"""Compute Interventions - Calculate intervention scores for grid cells"""
import geopandas as gpd
import numpy as np
from pathlib import Path
from shapely.geometry import Point

from data_loader import load_planting_sites_data

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data'
PROCESSED_DIR = DATA_DIR / 'processed'

def load_grid():
    """Load the grid with computed features"""
    grid_file = PROCESSED_DIR / 'citypulse_grid.geojson'
    if not grid_file.exists():
        raise FileNotFoundError(f"Grid file not found: {grid_file}. Run compute_features.py first.")
    return gpd.read_file(grid_file)

def compute_tree_interventions(grid_gdf):
    """
    Compute tree planting priority scores and recommendations
    Priority based on: heat_stress + air_stress + (1-canopy) + vulnerability
    """
    print("Computing tree interventions...")
    
    # Tree priority score (0-1)
    grid_gdf['tree_score'] = (
        0.3 * grid_gdf['heat_stress'] +
        0.25 * grid_gdf['air_stress'] +
        0.25 * (1 - grid_gdf['canopy']) +
        0.2 * grid_gdf['vulnerability_factor']
    )
    
    # Recommended tree count (proportional to score and cell need)
    # Higher scores = more trees needed
    grid_gdf['tree_count'] = (grid_gdf['tree_score'] * 50).astype(int).clip(0, 50)
    
    # Expected CSI reduction (heuristic: trees reduce heat and air stress)
    # Impact is higher where canopy is low
    canopy_impact = 1 - grid_gdf['canopy']
    heat_reduction = grid_gdf['tree_score'] * 0.4 * canopy_impact * grid_gdf['heat_stress']
    air_reduction = grid_gdf['tree_score'] * 0.25 * canopy_impact * grid_gdf['air_stress']
    
    # CSI weight for heat (0.25) and air (0.20)
    csi_reduction = (0.25 * heat_reduction + 0.20 * air_reduction) * 100
    grid_gdf['tree_delta_csi'] = -(csi_reduction * grid_gdf['vulnerability_factor']).clip(0, 30)
    
    return grid_gdf

def compute_car_limit_interventions(grid_gdf):
    """
    Compute car access restriction priority scores
    Priority based on: traffic_stress + noise_stress + proximity to sensitive areas
    """
    print("Computing car limit interventions...")
    
    # Car limit priority score (0-1)
    # High priority where traffic and noise are high
    grid_gdf['car_limit_score'] = (
        0.5 * grid_gdf['traffic_stress'] +
        0.3 * grid_gdf['noise_stress'] +
        0.2 * grid_gdf['vulnerability_factor']
    )
    
    # Determine intervention type based on stress levels
    conditions = [
        (grid_gdf['car_limit_score'] > 0.75) & (grid_gdf['vulnerability_factor'] > 0.6),
        (grid_gdf['car_limit_score'] > 0.65),
        (grid_gdf['car_limit_score'] > 0.5),
        (grid_gdf['car_limit_score'] > 0.3)
    ]
    
    choices = ['school_street', 'pedestrian_street', 'low_traffic_zone', 'traffic_calming']
    grid_gdf['car_limit_type'] = np.select(conditions, choices, default='none')
    
    # Expected CSI reduction (car limits reduce traffic and noise)
    traffic_reduction = grid_gdf['car_limit_score'] * 0.6 * grid_gdf['traffic_stress']
    noise_reduction = grid_gdf['car_limit_score'] * 0.5 * grid_gdf['noise_stress']
    
    # CSI weights for traffic (0.25) and noise (0.15)
    csi_reduction = (0.25 * traffic_reduction + 0.15 * noise_reduction) * 100
    grid_gdf['car_limit_delta_csi'] = -(csi_reduction * grid_gdf['vulnerability_factor']).clip(0, 35)
    
    return grid_gdf

def compute_transit_interventions(grid_gdf):
    """
    Compute transit improvement priority scores
    Priority based on: traffic_stress + crowding_stress + poor transit access
    """
    print("Computing transit interventions...")
    
    from shapely.geometry import Point
    montreal_center = Point(-73.567256, 45.508888)
    dist_to_center = grid_gdf.geometry.centroid.distance(montreal_center)
    max_dist = dist_to_center.max()
    transit_access = 1 - (dist_to_center / max_dist)
    transit_access = transit_access.clip(0.2, 1)  # Min 0.2 access everywhere
    
    # Transit priority score (0-1)
    # High priority where traffic is high but transit access is poor
    grid_gdf['transit_score'] = (
        0.4 * grid_gdf['traffic_stress'] +
        0.3 * (1 - transit_access) +
        0.2 * grid_gdf['crowding_stress'] +
        0.1 * grid_gdf['vulnerability_factor']
    )
    
    # Determine intervention type
    conditions = [
        (grid_gdf['transit_score'] > 0.7) & (transit_access < 0.5),
        (grid_gdf['transit_score'] > 0.6),
        (grid_gdf['transit_score'] > 0.4)
    ]
    
    choices = ['new_stop', 'frequency_increase', 'route_extension']
    grid_gdf['transit_type'] = np.select(conditions, choices, default='none')
    
    # Expected CSI reduction (transit improvements reduce traffic and crowding)
    traffic_reduction = grid_gdf['transit_score'] * 0.3 * grid_gdf['traffic_stress']
    crowding_reduction = grid_gdf['transit_score'] * 0.5 * grid_gdf['crowding_stress']
    
    # CSI weights for traffic (0.25) and crowding (0.15)
    csi_reduction = (0.25 * traffic_reduction + 0.15 * crowding_reduction) * 100
    grid_gdf['transit_delta_csi'] = -(csi_reduction * grid_gdf['vulnerability_factor']).clip(0, 25)
    
    return grid_gdf

def generate_tree_planting_sites(grid_gdf):
    """Generate tree planting sites GeoJSON from real dataset when available"""
    print("Generating tree planting sites...")
    
    planting_sites = load_planting_sites_data()
    if planting_sites is not None and not planting_sites.empty:
        print(f"    Using {len(planting_sites)} real planting site records")
        
        # Keep only valid sites within the grid extent (Montreal + Laval)
        grid_boundary = grid_gdf.unary_union
        planting_sites = planting_sites[
            planting_sites.geometry.within(grid_boundary.buffer(0.0005))
        ].copy()
        print(f"    Retained {len(planting_sites)} sites inside project boundary")
        
        # Join with grid to inherit cell id and tree priority score
        grid_for_join = (
            grid_gdf[['id', 'tree_score', 'tree_count', 'geometry']]
            .rename(columns={'id': 'cell_id'})
            .copy()
        )
        joined = gpd.sjoin(
            planting_sites,
            grid_for_join,
            predicate='within',
            how='left'
        )
        median_score = joined['tree_score'].median()
        if np.isnan(median_score):
            median_score = 0.0
        joined['priority_score'] = joined['tree_score'].fillna(median_score)
        joined['recommended_trees'] = joined['tree_count'].fillna(0).astype(int).clip(lower=0)
        
        # Build GeoJSON features
        features = []
        for row in joined.itertuples():
            # Handle NaN values properly - convert to None or valid defaults
            cell_id = getattr(row, 'cell_id', None)
            if cell_id is not None and (isinstance(cell_id, float) and np.isnan(cell_id)):
                cell_id = None
            
            priority_score = getattr(row, 'priority_score', 0.0)
            if isinstance(priority_score, float) and np.isnan(priority_score):
                priority_score = 0.0
            
            recommended_trees = getattr(row, 'recommended_trees', 0)
            if isinstance(recommended_trees, float) and np.isnan(recommended_trees):
                recommended_trees = 0
            
            props = {
                'cell_id': cell_id,
                'priority_score': float(priority_score),
                'recommended_trees': int(recommended_trees),
                'status': getattr(row, 'Statut', None),
                'site_state': getattr(row, 'Etat_site', None),
                'site_type': getattr(row, 'Type_emp', None),
            }
            # Remove None values that might cause issues
            props = {k: v for k, v in props.items() if v is not None or k == 'cell_id'}
            features.append({
                'type': 'Feature',
                'geometry': row.geometry.__geo_interface__,
                'properties': props
            })
        
        planting_geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
    else:
        print("    Real planting site data unavailable - using synthetic centroids")
        # Fallback to centroids of top priority cells
        top_cells = grid_gdf.nlargest(100, 'tree_score')
        features = []
        for _, cell in top_cells.iterrows():
            centroid = cell.geometry.centroid
            features.append({
                'type': 'Feature',
                'geometry': Point(centroid.x, centroid.y).__geo_interface__,
                'properties': {
                    'cell_id': cell['id'],
                    'priority_score': float(cell['tree_score']),
                    'recommended_trees': int(cell['tree_count']),
                    'status': None,
                    'site_state': None,
                    'site_type': 'synthetic'
                }
            })
        planting_geojson = {'type': 'FeatureCollection', 'features': features}
    
    # Save to file
    import json
    output_file = PROCESSED_DIR / 'planting_sites.geojson'
    with open(output_file, 'w') as f:
        json.dump(planting_geojson, f)
    
    print(f"[OK] Generated {len(planting_geojson['features'])} planting sites")
    return planting_geojson

def generate_tree_locations(grid_gdf):
    """Generate sample existing tree locations"""
    print("Generating existing tree locations...")
    
    # Simulate existing trees (more in areas with higher canopy)
    np.random.seed(42)
    trees = []
    tree_id = 1
    
    for idx, cell in grid_gdf.iterrows():
        # Number of trees proportional to canopy
        n_trees = int(cell['canopy'] * 20)
        
        if n_trees > 0:
            # Generate random points within cell bounds
            bounds = cell.geometry.bounds  # minx, miny, maxx, maxy
            
            for _ in range(min(n_trees, 5)):  # Limit to keep file size reasonable
                lon = np.random.uniform(bounds[0], bounds[2])
                lat = np.random.uniform(bounds[1], bounds[3])
                
                trees.append({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [lon, lat]
                    },
                    'properties': {
                        'tree_id': tree_id,
                        'cell_id': cell['id']
                    }
                })
                tree_id += 1
    
    trees_geojson = {
        'type': 'FeatureCollection',
        'features': trees
    }
    
    # Save to file
    import json
    output_file = PROCESSED_DIR / 'trees.geojson'
    with open(output_file, 'w') as f:
        json.dump(trees_geojson, f)
    
    print(f"[OK] Generated {len(trees)} tree locations")
    return trees_geojson

def main():
    """Main processing pipeline"""
    print("=== Computing Interventions ===\n")
    
    # Load grid
    print("Loading grid with features...")
    grid = load_grid()
    print(f"Loaded {len(grid)} cells\n")
    
    # Compute interventions
    grid = compute_tree_interventions(grid)
    grid = compute_car_limit_interventions(grid)
    grid = compute_transit_interventions(grid)
    
    # Generate auxiliary datasets
    generate_tree_planting_sites(grid)
    generate_tree_locations(grid)
    
    # Save final grid
    output_file = PROCESSED_DIR / 'citypulse_grid.geojson'
    grid.to_file(output_file, driver='GeoJSON')
    print(f"\n[OK] Saved final grid to {output_file}")
    
    # Print summary statistics
    print("\n=== Intervention Summary ===")
    print(f"Cells with high tree priority (score > 0.7): {(grid['tree_score'] > 0.7).sum()}")
    print(f"Cells with car limit recommendations: {(grid['car_limit_score'] > 0.5).sum()}")
    print(f"Cells with transit improvements needed: {(grid['transit_score'] > 0.5).sum()}")
    print(f"\nTop intervention by average score:")
    print(f"  Trees: {grid['tree_score'].mean():.3f}")
    print(f"  Car limits: {grid['car_limit_score'].mean():.3f}")
    print(f"  Transit: {grid['transit_score'].mean():.3f}")
    
    print("\n[OK] Intervention computation complete!")

if __name__ == '__main__':
    main()

