"""Scenario Engine - Applies scenario adjustments to compute 2035 CSI"""
import pandas as pd
import geopandas as gpd
import numpy as np

def apply_scenario_adjustments(grid_data: gpd.GeoDataFrame, car: float, trees: float, transit: float) -> gpd.GeoDataFrame:
    """Apply scenario parameters to adjust stress metrics and recompute CSI"""
    gdf = grid_data.copy()
    
    gdf['air_stress_scenario'] = gdf['air_stress']
    gdf['heat_stress_scenario'] = gdf['heat_stress']
    gdf['noise_stress_scenario'] = gdf['noise_stress']
    gdf['traffic_stress_scenario'] = gdf['traffic_stress']
    gdf['crowding_stress_scenario'] = gdf['crowding_stress']
    
    if car < 0:
        reduction_factor = abs(car)
        gdf['traffic_stress_scenario'] *= (1 - reduction_factor * 0.6)
        gdf['noise_stress_scenario'] *= (1 - reduction_factor * 0.5)
        gdf['air_stress_scenario'] *= (1 - reduction_factor * 0.3)
    
    if trees > 0:
        canopy_factor = 1 - gdf.get('canopy', 0.5)
        gdf['heat_stress_scenario'] *= (1 - trees * 0.4 * canopy_factor)
        gdf['air_stress_scenario'] *= (1 - trees * 0.25 * canopy_factor)
    
    if transit > 0:
        gdf['crowding_stress_scenario'] *= (1 - transit * 0.5)
        gdf['traffic_stress_scenario'] *= (1 - transit * 0.2)
    
    weights = {'air': 0.20, 'heat': 0.25, 'noise': 0.15, 'traffic': 0.25, 'crowding': 0.15}
    
    base_csi = (
        weights['air'] * gdf['air_stress_scenario'] +
        weights['heat'] * gdf['heat_stress_scenario'] +
        weights['noise'] * gdf['noise_stress_scenario'] +
        weights['traffic'] * gdf['traffic_stress_scenario'] +
        weights['crowding'] * gdf['crowding_stress_scenario']
    ) * 100
    
    vulnerability = gdf.get('vulnerability_factor', 1.0)
    gdf['csi_scenario'] = (base_csi * (0.5 + 0.5 * vulnerability)).clip(0, 100)
    
    return gdf

def compute_aggregate_metrics(grid_data: gpd.GeoDataFrame) -> dict:
    """Compute aggregate metrics for comparison"""
    return {
        'avg_csi_current': float(grid_data['csi_current'].mean()),
        'avg_csi_scenario': float(grid_data.get('csi_scenario', grid_data['csi_current']).mean()),
        'max_csi_current': float(grid_data['csi_current'].max()),
        'max_csi_scenario': float(grid_data.get('csi_scenario', grid_data['csi_current']).max()),
        'hotspot_count_current': int((grid_data['csi_current'] > 70).sum()),
        'hotspot_count_scenario': int((grid_data.get('csi_scenario', grid_data['csi_current']) > 70).sum()),
        'total_cells': len(grid_data)
    }

