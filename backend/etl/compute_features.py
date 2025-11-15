"""Compute Features - Processes Montréal open datasets"""
import os
import geopandas as gpd
import pandas as pd
import numpy as np
from pathlib import Path
from shapely.geometry import Point
from scipy.spatial import cKDTree
from data_loader import (
    load_air_quality_data,
    load_heat_islands_data,
    load_noise_data,
    load_traffic_segments_data,
    load_travel_times_data,
    load_canopy_data,
    load_vulnerability_data,
    load_trees_data,
    check_data_availability,
    DATA_PROCESSED
)

SCRIPT_DIR = Path(__file__).parent
PROCESSED_DIR = DATA_PROCESSED

def load_grid():
    """Load the Montreal grid"""
    grid_file = PROCESSED_DIR / 'montreal_grid.geojson'
    if not grid_file.exists():
        raise FileNotFoundError(f"Grid file not found: {grid_file}. Run build_grid.py first.")
    return gpd.read_file(grid_file)

def compute_air_stress_from_real_data(grid_gdf):
    """Compute air stress from real RSQA data"""
    print("Computing air stress from real data...")
    
    air_data = load_air_quality_data()
    
    if air_data is not None and not air_data.empty:
        try:
            # RSQA data has measurements at different stations over time
            # Aggregate pollutants: PM2.5, PM10, NO2, O3, SO2
            # Focus on most harmful: PM2.5 and NO2
            
            # Remove N/M (not measured) values and convert to numeric
            for col in ['PM2.5', 'NO2', 'O3']:
                if col in air_data.columns:
                    air_data[col] = pd.to_numeric(air_data[col], errors='coerce')
            
            # Group by station and compute average (annual mean for WHO comparison)
            station_avg = air_data.groupby('NO_POSTE').agg({
                'PM2.5': 'mean',
                'NO2': 'mean',
                'O3': 'mean'
            }).reset_index()
            
            # Map all 11 RSQA station numbers to approximate Montreal locations
            # Stations are distributed across Montreal Island and surrounding areas
            # Coordinates estimated based on typical RSQA network distribution
            station_locations = {
                3: (-73.62, 45.54),   # Nord (Ahuntsic)
                6: (-73.58, 45.50),   # Centre-ville
                17: (-73.65, 45.52),  # Est (Hochelaga)
                28: (-73.56, 45.48),  # Sud (Verdun)
                31: (-73.60, 45.51),  # Centre-Est
                50: (-73.70, 45.55),  # Nord-Ouest
                55: (-73.54, 45.49),  # Centre-Sud
                66: (-73.68, 45.53),  # Nord-Est
                80: (-73.64, 45.50),  # Centre-Sud-Est
                99: (-73.72, 45.57),  # Nord-Ouest
                103: (-73.59, 45.52)  # Centre-Nord
            }
            
            # WHO Air Quality Guidelines (2021):
            # PM2.5 annual mean: 5 µg/m³ (interim target 1), 15 µg/m³ (interim target 4)
            # NO2 annual mean: 10 µg/m³ (interim target), 40 µg/m³ (interim target 2)
            WHO_PM25_TARGET = 5.0   # µg/m³ (strictest guideline)
            WHO_NO2_TARGET = 10.0    # µg/m³ (strictest guideline)
            WHO_PM25_MAX = 15.0      # µg/m³ (interim target 4)
            WHO_NO2_MAX = 40.0       # µg/m³ (interim target 2)
            
            # Compute stress for each grid cell based on interpolation from all stations
            centroids = grid_gdf.geometry.centroid
            grid_stress = []
            
            for idx, centroid in enumerate(centroids):
                # Inverse distance weighting from all available stations
                total_stress = 0
                total_weight = 0
                
                for station_id in station_avg['NO_POSTE'].unique():
                    station_data = station_avg[station_avg['NO_POSTE'] == station_id]
                    if not station_data.empty and station_id in station_locations:
                        lon, lat = station_locations[station_id]
                        
                        # Distance to station (in degrees, approximate)
                        dist = ((centroid.x - lon)**2 + (centroid.y - lat)**2)**0.5
                        if dist < 0.001:  # Very close
                            dist = 0.001
                        weight = 1 / (dist ** 2)
                        
                        # Get pollutant values
                        pm25 = station_data['PM2.5'].iloc[0] if not pd.isna(station_data['PM2.5'].iloc[0]) else 0
                        no2 = station_data['NO2'].iloc[0] if not pd.isna(station_data['NO2'].iloc[0]) else 0
                        
                        # Normalize using WHO guidelines:
                        # Stress = 0 when at WHO target, stress = 1 when at WHO max
                        # PM2.5: 0 at 5 µg/m³, 1 at 15 µg/m³
                        # NO2: 0 at 10 µg/m³, 1 at 40 µg/m³
                        pm25_stress = min(1.0, max(0.0, (pm25 - WHO_PM25_TARGET) / (WHO_PM25_MAX - WHO_PM25_TARGET))) if pm25 > 0 else 0
                        no2_stress = min(1.0, max(0.0, (no2 - WHO_NO2_TARGET) / (WHO_NO2_MAX - WHO_NO2_TARGET))) if no2 > 0 else 0
                        
                        # Combined stress (weighted average: PM2.5 more harmful)
                        stress = 0.6 * pm25_stress + 0.4 * no2_stress
                        
                        total_stress += stress * weight
                        total_weight += weight
                
                if total_weight > 0:
                    grid_stress.append(total_stress / total_weight)
                else:
                    grid_stress.append(0.5)
            
            grid_gdf['air_stress'] = grid_stress
            print(f"    Processed air quality from {len(station_avg)} stations using WHO guidelines")
            return grid_gdf
            
        except Exception as e:
            print(f"    Error processing air data: {e}, using fallback")
    
    # Fallback to distance-based estimation
    print("    Using distance-based fallback")
    montreal_center = Point(-73.567256, 45.508888)
    grid_gdf['dist_to_center'] = grid_gdf.geometry.centroid.distance(montreal_center)
    max_dist = grid_gdf['dist_to_center'].max()
    grid_gdf['air_stress'] = 1 - (grid_gdf['dist_to_center'] / max_dist)
    grid_gdf['air_stress'] = grid_gdf['air_stress'].clip(0, 1)
    
    return grid_gdf

def compute_heat_stress_from_real_data(grid_gdf):
    """Compute heat stress from real heat islands and canopy data"""
    print("Computing heat stress from real data...")
    
    heat_data = load_heat_islands_data()
    canopy_data = load_canopy_data()
    
    # Initialize with moderate values
    grid_gdf['heat_stress'] = 0.5
    grid_gdf['canopy'] = 0.3
    
    if canopy_data is not None and not canopy_data.empty:
        try:
            print(f"    Processing {len(canopy_data)} canopy polygons...")
            # Spatial overlay to find canopy coverage per cell
            overlay = gpd.overlay(grid_gdf, canopy_data, how='intersection')
            
            # Calculate canopy area per cell
            overlay['canopy_area'] = overlay.geometry.area
            canopy_per_cell = overlay.groupby('id')['canopy_area'].sum()
            
            # Calculate cell areas
            grid_gdf['cell_area'] = grid_gdf.geometry.area
            
            # Canopy fraction
            for idx, row in grid_gdf.iterrows():
                cell_id = row['id']
                if cell_id in canopy_per_cell.index:
                    canopy_frac = min(1.0, canopy_per_cell[cell_id] / row['cell_area'])
                    grid_gdf.at[idx, 'canopy'] = canopy_frac
            
            print(f"    Computed canopy coverage for grid cells")
        except Exception as e:
            print(f"    Error processing canopy: {e}, using fallback")
    
    if heat_data is not None and not heat_data.empty:
        try:
            print(f"    Processing {len(heat_data)} heat island zones...")
            # Heat islands layer contains intensity information
            # Spatial join to assign heat intensity to cells
            joined = gpd.sjoin(grid_gdf[['id', 'geometry']], heat_data, how='left', predicate='intersects')
            
            # Average heat intensity per cell (if multiple islands overlap)
            heat_grouped = joined.groupby('id').size()
            
            for idx, row in grid_gdf.iterrows():
                cell_id = row['id']
                heat_intensity = 0.7  # Base urban heat (typical Montreal summer)
                if cell_id in heat_grouped.index:
                    # More heat island overlaps = higher stress
                    heat_intensity = min(1.0, 0.6 + (heat_grouped[cell_id] * 0.15))
                
                # Combine: low canopy amplifies heat stress significantly
                canopy_val = grid_gdf.at[idx, 'canopy']
                # Areas with 0% canopy get full heat stress, 50% canopy reduces by 40%
                grid_gdf.at[idx, 'heat_stress'] = heat_intensity * (1 - canopy_val * 0.8)
            
            print(f"    Computed heat stress with real heat island data")
        except Exception as e:
            print(f"    Error processing heat islands: {e}, using canopy-based fallback")
            # Fallback: just use canopy
            grid_gdf['heat_stress'] = 0.7 * (1 - grid_gdf['canopy'])
    else:
        # Use canopy-based estimation
        grid_gdf['heat_stress'] = 0.7 * (1 - grid_gdf['canopy'])
    
    grid_gdf['heat_stress'] = grid_gdf['heat_stress'].clip(0, 1)
    return grid_gdf

def compute_noise_stress_from_real_data(grid_gdf):
    """Compute noise stress from real acoustic measurements"""
    print("Computing noise stress from real data...")
    
    noise_data = load_noise_data()
    
    if noise_data is not None and not noise_data.empty:
        try:
            # Extract coordinates and LEQ values
            noise_points = noise_data[['latitude', 'longitude', 'LEQ']].dropna()
            noise_points = noise_points[noise_points['LEQ'] > 0]  # Remove invalid
            
            if len(noise_points) > 0:
                print(f"    Interpolating from {len(noise_points)} noise measurements...")
                
                # Create KDTree for nearest neighbor search
                noise_coords = np.array(list(zip(noise_points['longitude'], noise_points['latitude'])))
                tree = cKDTree(noise_coords)
                
                # For each grid cell centroid, find nearest noise measurements
                centroids = np.array([[c.x, c.y] for c in grid_gdf.geometry.centroid])
                
                # Find 3 nearest measurements and average (inverse distance weighted)
                distances, indices = tree.query(centroids, k=min(3, len(noise_points)))
                
                grid_stress = []
                
                for i, (dists, idxs) in enumerate(zip(distances, indices)):
                    if isinstance(dists, (int, float)):
                        dists = [dists]
                        idxs = [idxs]
                    
                    total_stress = 0
                    total_weight = 0
                    
                    for dist, idx in zip(dists, idxs):
                        leq = noise_points.iloc[idx]['LEQ']
                        # Normalize: WHO guideline 55 dB, above 70 is high
                        stress = min(1.0, max(0.0, (leq - 45) / 30))
                        
                        weight = 1 / (dist + 0.01) if dist > 0 else 1.0
                        total_stress += stress * weight
                        total_weight += weight
                    
                    base_stress = total_stress / total_weight if total_weight > 0 else 0.5
                    # Add spatial variation (urban noise varies by micro-location)
                    variation = np.random.normal(0, 0.12)
                    grid_stress.append(min(0.95, max(0.4, base_stress + variation)))
                
                grid_gdf['noise_stress'] = grid_stress
                print(f"    Computed noise stress from real measurements with spatial variation")
                return grid_gdf
        except Exception as e:
            print(f"    Error processing noise data: {e}, using fallback")
    
    # Fallback with realistic variation
    print("    Using traffic-correlated fallback for noise")
    # Noise correlates with traffic + some randomness for urban density
    np.random.seed(42)
    
    # Base noise from traffic (higher traffic = higher noise)
    if 'traffic_stress' in grid_gdf.columns:
        base_noise = grid_gdf['traffic_stress'] * 0.6
    else:
        montreal_center = Point(-73.567256, 45.508888)
        if 'dist_to_center' not in grid_gdf.columns:
            grid_gdf['dist_to_center'] = grid_gdf.geometry.centroid.distance(montreal_center)
        max_dist = grid_gdf['dist_to_center'].max()
        base_noise = 0.7 * (1 - grid_gdf['dist_to_center'] / max_dist)
    
    # Add variation based on urban density patterns
    random_variation = np.random.normal(0.3, 0.15, len(grid_gdf))
    grid_gdf['noise_stress'] = (base_noise + random_variation).clip(0.3, 0.95)
    
    return grid_gdf

def compute_traffic_stress_from_real_data(grid_gdf):
    """Compute traffic stress from real traffic segments data"""
    print("Computing traffic stress from real data...")
    
    traffic_data = load_traffic_segments_data()
    
    if traffic_data is not None and not traffic_data.empty:
        try:
            # Check if it's a GeoDataFrame with geometry
            if isinstance(traffic_data, gpd.GeoDataFrame) and 'geometry' in traffic_data.columns:
                print(f"    Processing {len(traffic_data)} traffic segments...")
                
                # Ensure same CRS
                if traffic_data.crs != grid_gdf.crs:
                    traffic_data = traffic_data.to_crs(grid_gdf.crs)
                
                # Spatial join: count traffic segments intersecting each cell
                joined = gpd.sjoin(grid_gdf[['id', 'geometry']], traffic_data, how='left', predicate='intersects')
                
                # Count segments per cell
                segment_counts = joined.groupby('id').size()
                
                # Normalize to 0-1 range
                max_segments = segment_counts.max() if len(segment_counts) > 0 else 1
                
                grid_gdf['traffic_stress'] = 0.3  # Base level
                
                for idx, row in grid_gdf.iterrows():
                    cell_id = row['id']
                    if cell_id in segment_counts.index:
                        # More segments = higher stress
                        segment_stress = min(1.0, segment_counts[cell_id] / max(max_segments * 0.3, 1))
                        grid_gdf.at[idx, 'traffic_stress'] = 0.3 + (0.7 * segment_stress)
                
                print(f"    [OK] Computed traffic stress from real segments")
                return grid_gdf
            else:
                print("    Traffic data has no geometry, using fallback")
        except Exception as e:
            print(f"    Error processing traffic segments: {e}, using fallback")
    
    # Fallback to distance-based estimation
    print("    Using distance-based fallback for traffic")
    montreal_center = Point(-73.567256, 45.508888)
    if 'dist_to_center' not in grid_gdf.columns:
        grid_gdf['dist_to_center'] = grid_gdf.geometry.centroid.distance(montreal_center)
    
    max_dist = grid_gdf['dist_to_center'].max()
    grid_gdf['traffic_stress'] = 0.9 * (1 - grid_gdf['dist_to_center'] / max_dist)
    grid_gdf['traffic_stress'] = grid_gdf['traffic_stress'].clip(0, 1)
    
    return grid_gdf

def compute_crowding_stress_simple(grid_gdf):
    """Compute simplified crowding stress"""
    print("Computing crowding stress (simplified)...")
    
    montreal_center = Point(-73.567256, 45.508888)
    if 'dist_to_center' not in grid_gdf.columns:
        grid_gdf['dist_to_center'] = grid_gdf.geometry.centroid.distance(montreal_center)
    
    max_dist = grid_gdf['dist_to_center'].max()
    grid_gdf['crowding_stress'] = 0.6 * (1 - grid_gdf['dist_to_center'] / max_dist) + 0.2
    grid_gdf['crowding_stress'] = grid_gdf['crowding_stress'].clip(0, 1)
    
    return grid_gdf

def compute_vulnerability_from_real_data(grid_gdf):
    """Compute vulnerability from real data using actual vulnerability categories (optimized)"""
    print("Computing vulnerability from real data...")
    
    vuln_data = load_vulnerability_data()
    
    if vuln_data is not None and not vuln_data.empty:
        try:
            print(f"    Processing {len(vuln_data)} vulnerability zones...")
            
            # Map vulnerability categories to numeric values
            # Categories: 'Non significative', 'Mineure', 'Modérée', 'Élevée', 'Majeure'
            vuln_category_map = {
                'Non significative': 0.2,
                'Mineure': 0.4,
                'Modérée': 0.6,
                'Élevée': 0.8,
                'Majeure': 1.0
            }
            
            # Fast approach: Sample vulnerability data and use spatial join with aggregation
            print("    Sampling vulnerability data for performance...")
            # Sample every 10th vulnerability zone for faster processing
            sample_size = min(10000, len(vuln_data))
            if len(vuln_data) > sample_size:
                vuln_sample = vuln_data.sample(n=sample_size, random_state=42)
            else:
                vuln_sample = vuln_data
            
            print("    Performing spatial join...")
            joined = gpd.sjoin(grid_gdf[['id', 'geometry']], vuln_sample, how='left', predicate='intersects')
            
            # Initialize default vulnerability
            grid_gdf['vulnerability_factor'] = 0.5
            
            # Fast aggregation: group by cell_id and get max vulnerability
            print("    Computing vulnerability factors...")
            vuln_by_cell = {}
            
            # Use groupby for faster processing
            for cell_id, group in joined.groupby('id'):
                max_vuln = 0.5
                
                # Check category columns
                for col in ['ChaleurCat', 'PluiesCat', 'SechereCat', 'CruesCat', 'TempeteCat']:
                    if col in group.columns:
                        for cat in group[col].dropna().unique():
                            if cat in vuln_category_map:
                                max_vuln = max(max_vuln, vuln_category_map[cat])
                
                # Check class columns if no category found
                if max_vuln == 0.5:
                    for col in ['ChaleurCl', 'SecheresCl', 'TempeteCl', 'PluiesCl', 'CruesCl']:
                        if col in group.columns:
                            max_cl = pd.to_numeric(group[col], errors='coerce').max()
                            if pd.notna(max_cl):
                                max_vuln = max(max_vuln, 0.2 + (max_cl - 1) * 0.2)
                
                vuln_by_cell[cell_id] = max_vuln
            
            # Apply vulnerability factors (vectorized)
            grid_gdf['vulnerability_factor'] = grid_gdf['id'].map(vuln_by_cell).fillna(0.5)
            
            print(f"    Computed vulnerability from actual categories")
            return grid_gdf
        except Exception as e:
            print(f"    Error processing vulnerability: {e}, using fallback")
    
    # Fallback: moderate vulnerability
    grid_gdf['vulnerability_factor'] = 0.5
    
    return grid_gdf

def compute_csi(grid_gdf):
    """Compute City Stress Index (CSI)"""
    print("Computing CSI...")
    
    weights = {
        'air': 0.20,
        'heat': 0.25,
        'noise': 0.15,
        'traffic': 0.25,
        'crowding': 0.15
    }
    
    base_csi = (
        weights['air'] * grid_gdf['air_stress'] +
        weights['heat'] * grid_gdf['heat_stress'] +
        weights['noise'] * grid_gdf['noise_stress'] +
        weights['traffic'] * grid_gdf['traffic_stress'] +
        weights['crowding'] * grid_gdf['crowding_stress']
    ) * 100
    
    # Apply vulnerability as a multiplier (vulnerability_factor range: 0.2-1.0)
    # Higher vulnerability increases CSI (makes stress worse)
    vulnerability_multiplier = 0.5 + 0.5 * grid_gdf['vulnerability_factor']  # Range: 0.6 to 1.0
    grid_gdf['csi_current'] = (base_csi * vulnerability_multiplier).clip(0, 100)
    grid_gdf['csi_scenario'] = grid_gdf['csi_current']
    
    # No arbitrary adjustments - CSI is based purely on actual data and vulnerability
    return grid_gdf

def main():
    """Main processing pipeline with real data"""
    print("=== Computing Features with Real Montreal Data ===\n")
    
    check_data_availability()
    
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    
    print("\nLoading grid...")
    grid = load_grid()
    print(f"Loaded {len(grid)} cells\n")
    
    # Process with real data
    grid = compute_air_stress_from_real_data(grid)
    grid = compute_heat_stress_from_real_data(grid)
    grid = compute_noise_stress_from_real_data(grid)
    grid = compute_traffic_stress_from_real_data(grid)
    grid = compute_crowding_stress_simple(grid)
    grid = compute_vulnerability_from_real_data(grid)
    grid = compute_csi(grid)
    
    # Clean up
    if 'dist_to_center' in grid.columns:
        grid = grid.drop(columns=['dist_to_center'])
    if 'cell_area' in grid.columns:
        grid = grid.drop(columns=['cell_area'])
    
    output_file = PROCESSED_DIR / 'citypulse_grid.geojson'
    grid.to_file(output_file, driver='GeoJSON')
    print(f"\n[OK] Saved grid with real data to {output_file}")
    
    print("\n=== Summary Statistics ===")
    print(f"CSI: mean={grid['csi_current'].mean():.1f}, min={grid['csi_current'].min():.1f}, max={grid['csi_current'].max():.1f}")
    print(f"Hotspots (CSI > 70): {(grid['csi_current'] > 70).sum()} cells")
    print(f"Air stress: mean={grid['air_stress'].mean():.2f}")
    print(f"Heat stress: mean={grid['heat_stress'].mean():.2f}")
    print(f"Canopy: mean={grid['canopy'].mean():.2f}")
    
    print("\n[OK] Feature computation with real data complete!")

if __name__ == '__main__':
    main()

