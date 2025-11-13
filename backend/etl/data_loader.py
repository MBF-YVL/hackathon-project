"""
Data Loader Module
Handles loading real datasets with fallback to simulated data
"""
import os
from pathlib import Path
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point

# Data directories
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW = PROJECT_ROOT / 'data' / 'raw'
DATA_PROCESSED = PROJECT_ROOT / 'data' / 'processed'

def file_exists(filename):
    """Check if a data file exists"""
    return (DATA_RAW / filename).exists()

def load_air_quality_data():
    """Load air quality data from RSQA CSV or return None"""
    filepath = DATA_RAW / 'air_quality.csv'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real air quality data from {filepath.name}")
            df = pd.read_csv(filepath)
            # Expected columns: station_id, lat, lon, pollutant, concentration, date, etc.
            return df
        except Exception as e:
            print(f"  ✗ Error loading air quality data: {e}")
    return None

def load_heat_islands_data():
    """Load heat islands GeoJSON or return None"""
    # Try GeoJSON first
    filepath = DATA_RAW / 'heat_islands.geojson'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real heat islands data from {filepath.name}")
            gdf = gpd.read_file(filepath)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading heat islands: {e}")
    
    # Try shapefile
    shp_path = DATA_RAW / 'heat_islands.shp'
    if shp_path.exists():
        try:
            print(f"  ✓ Loading real heat islands data from {shp_path.name}")
            gdf = gpd.read_file(shp_path)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading heat islands: {e}")
    
    return None

def load_noise_data():
    """Load noise measurements CSV or return None"""
    filepath = DATA_RAW / 'noise.csv'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real noise data from {filepath.name}")
            df = pd.read_csv(filepath)
            # Expected columns: location_id, lat, lon, noise_level_db, date, etc.
            return df
        except Exception as e:
            print(f"  ✗ Error loading noise data: {e}")
    return None

def load_traffic_segments_data():
    """Load traffic segments geometry or return None"""
    filepath = DATA_RAW / 'traffic_segments.geojson'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real traffic segments from {filepath.name}")
            gdf = gpd.read_file(filepath)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading traffic segments: {e}")
    
    # Try shapefile
    shp_path = DATA_RAW / 'traffic_segments.shp'
    if shp_path.exists():
        try:
            print(f"  ✓ Loading real traffic segments from {shp_path.name}")
            gdf = gpd.read_file(shp_path)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading traffic segments: {e}")
    
    return None

def load_travel_times_data():
    """Load travel times CSV or return None"""
    filepath = DATA_RAW / 'travel_times.csv'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real travel times from {filepath.name}")
            df = pd.read_csv(filepath)
            # Expected columns: segment_id, travel_time, timestamp, etc.
            return df
        except Exception as e:
            print(f"  ✗ Error loading travel times: {e}")
    return None

def load_trees_data():
    """Load trees CSV or return None"""
    filepath = DATA_RAW / 'trees.csv'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real trees data from {filepath.name}")
            df = pd.read_csv(filepath)
            # Expected columns: tree_id, lat, lon, species, etc.
            # Convert to GeoDataFrame if lat/lon columns exist
            if 'Latitude' in df.columns and 'Longitude' in df.columns:
                geometry = [Point(xy) for xy in zip(df.Longitude, df.Latitude)]
                gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
                return gdf
            elif 'lat' in df.columns and 'lon' in df.columns:
                geometry = [Point(xy) for xy in zip(df.lon, df.lat)]
                gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
                return gdf
            return df
        except Exception as e:
            print(f"  ✗ Error loading trees data: {e}")
    return None

def load_planting_sites_data():
    """Load planting sites CSV or return None"""
    filepath = DATA_RAW / 'planting_sites.csv'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real planting sites from {filepath.name}")
            df = pd.read_csv(filepath)
            # Convert to GeoDataFrame if lat/lon columns exist
            if 'Latitude' in df.columns and 'Longitude' in df.columns:
                geometry = [Point(xy) for xy in zip(df.Longitude, df.Latitude)]
                gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
                return gdf
            elif 'lat' in df.columns and 'lon' in df.columns:
                geometry = [Point(xy) for xy in zip(df.lon, df.lat)]
                gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
                return gdf
            return df
        except Exception as e:
            print(f"  ✗ Error loading planting sites: {e}")
    return None

def load_canopy_data():
    """Load canopy GeoJSON or return None"""
    filepath = DATA_RAW / 'canopy.geojson'
    if filepath.exists():
        try:
            print(f"  ✓ Loading real canopy data from {filepath.name}")
            gdf = gpd.read_file(filepath)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading canopy: {e}")
    
    # Try shapefile
    shp_path = DATA_RAW / 'canopy.shp'
    if shp_path.exists():
        try:
            print(f"  ✓ Loading real canopy data from {shp_path.name}")
            gdf = gpd.read_file(shp_path)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading canopy: {e}")
    
    return None

def load_vulnerability_data():
    """Load vulnerability data from unzipped folder or return None"""
    vuln_dir = DATA_RAW / 'vulnerability'
    if vuln_dir.exists():
        # Look for shapefiles or GeoJSON in the directory
        for ext in ['.geojson', '.shp', '.gpkg']:
            files = list(vuln_dir.glob(f'*{ext}'))
            if files:
                try:
                    print(f"  ✓ Loading real vulnerability data from {files[0].name}")
                    gdf = gpd.read_file(files[0])
                    return gdf
                except Exception as e:
                    print(f"  ✗ Error loading vulnerability: {e}")
    return None

# Live API functions

def fetch_entraves_realtime():
    """Fetch real-time traffic closures (entraves) from live API"""
    import requests
    
    # Try Données Québec JSON feed
    url = "https://www.donneesquebec.ca/recherche/api/3/action/datastore_search?resource_id=e29e86f0-faed-4b5a-b28d-7f953c59b1ff&limit=1000"
    
    try:
        print("  → Fetching live entraves data...")
        response = requests.get(url, timeout=10)
        if response.ok:
            data = response.json()
            print(f"  ✓ Fetched {len(data.get('result', {}).get('records', []))} active entraves")
            return data.get('result', {}).get('records', [])
    except Exception as e:
        print(f"  ✗ Error fetching entraves: {e}")
    
    return None

def check_data_availability():
    """Print a summary of available data files"""
    print("\n=== Data Availability Check ===")
    
    files_to_check = {
        'Air Quality': 'air_quality.csv',
        'Heat Islands': 'heat_islands.geojson',
        'Noise': 'noise.csv',
        'Traffic Segments': 'traffic_segments.geojson',
        'Travel Times': 'travel_times.csv',
        'Trees': 'trees.csv',
        'Planting Sites': 'planting_sites.csv',
        'Canopy': 'canopy.geojson',
        'Vulnerability': 'vulnerability/',
    }
    
    for name, filename in files_to_check.items():
        path = DATA_RAW / filename
        status = "✓ FOUND" if path.exists() else "✗ MISSING (will use simulated data)"
        print(f"{name:20s}: {status}")
    
    print("\nTo download real data, see: data/README.md")
    print("=" * 50 + "\n")

