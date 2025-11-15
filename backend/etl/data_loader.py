"""Data Loader - Handles loading real datasets with fallback to simulated data"""
import os
from pathlib import Path
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point

# Data directories
SCRIPT_DIR = Path(__file__).parent
BACKEND_ROOT = SCRIPT_DIR.parent
DATA_RAW = BACKEND_ROOT / 'data' / 'raw'
DATA_PROCESSED = BACKEND_ROOT / 'data' / 'processed'

def file_exists(filename):
    """Check if a data file exists"""
    return (DATA_RAW / filename).exists()

def load_air_quality_data():
    """Load air quality data from RSQA CSV or return None"""
    filepath = DATA_RAW / 'air_quality.csv'
    if filepath.exists():
        try:
            print(f"  [OK] Loading real air quality data from {filepath.name}")
            df = pd.read_csv(filepath)
            # RSQA columns: NO_POSTE, DATE_HEURE, CO, NO2, PM2.5, PM10, O3, SO2, etc.
            # Keep relevant pollutants and station info
            print(f"    Loaded {len(df)} air quality measurements")
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
            print(f"  [OK] Loading real heat islands data from {filepath.name}")
            gdf = gpd.read_file(filepath)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading heat islands: {e}")
    
    # Try shapefile
    shp_path = DATA_RAW / 'heat_islands.shp'
    if shp_path.exists():
        try:
            print(f"  [OK] Loading real heat islands data from {shp_path.name}")
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
            print(f"  [OK] Loading real noise data from {filepath.name}")
            df = pd.read_csv(filepath)
            # Columns: horodatage, latitude, longitude, LEQ, Lmin, Lmax, L10, L50, L90, etc.
            # LEQ is the equivalent continuous sound level (main metric)
            print(f"    Loaded {len(df)} noise measurements")
            return df
        except Exception as e:
            print(f"  ✗ Error loading noise data: {e}")
    return None

def load_traffic_segments_data():
    """Load traffic segments geometry or return None"""
    # Try CSV first
    csv_path = DATA_RAW / 'traffic_segments.csv'
    if csv_path.exists():
        try:
            print(f"  [OK] Loading real traffic segments from {csv_path.name}")
            df = pd.read_csv(csv_path)
            
            # Check for coordinate columns and convert comma decimals to dots
            coord_cols = ['SrcLatitude', 'SrcLongitude', 'DestLatitude', 'DestLongitude']
            has_coords = all(col in df.columns for col in coord_cols)
            
            if has_coords:
                # Convert comma-separated decimals to dots (European format)
                for col in coord_cols:
                    if df[col].dtype == 'object':
                        df[col] = df[col].str.replace(',', '.').astype(float)
                
                # Create LineString geometries from source to destination
                from shapely.geometry import LineString
                geometries = []
                for _, row in df.iterrows():
                    try:
                        line = LineString([
                            (row['SrcLongitude'], row['SrcLatitude']),
                            (row['DestLongitude'], row['DestLatitude'])
                        ])
                        geometries.append(line)
                    except:
                        geometries.append(None)
                
                gdf = gpd.GeoDataFrame(df, geometry=geometries, crs='EPSG:4326')
                gdf = gdf[gdf.geometry.notna()]  # Remove invalid geometries
                print(f"    Loaded {len(gdf)} traffic segments with geometries")
                return gdf
            else:
                print(f"    Loaded {len(df)} traffic segments (no geometry)")
                return df
        except Exception as e:
            print(f"  ✗ Error loading traffic segments CSV: {e}")
    
    # Try GeoJSON
    filepath = DATA_RAW / 'traffic_segments.geojson'
    if filepath.exists():
        try:
            print(f"  [OK] Loading real traffic segments from {filepath.name}")
            gdf = gpd.read_file(filepath)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading traffic segments: {e}")
    
    # Try shapefile
    shp_path = DATA_RAW / 'traffic_segments.shp'
    if shp_path.exists():
        try:
            print(f"  [OK] Loading real traffic segments from {shp_path.name}")
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
            print(f"  [OK] Loading real travel times from {filepath.name}")
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
            print(f"  [OK] Loading real trees data from {filepath.name}")
            df = pd.read_csv(filepath)
            # Columns: Latitude, Longitude, Essence_fr, DHP, Date_Plantation, etc.
            if 'Latitude' in df.columns and 'Longitude' in df.columns:
                # Filter out invalid coordinates
                df = df.dropna(subset=['Latitude', 'Longitude'])
                df = df[(df['Latitude'] != 0) & (df['Longitude'] != 0)]
                geometry = [Point(lon, lat) for lon, lat in zip(df.Longitude, df.Latitude)]
                gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
                print(f"    Loaded {len(gdf)} trees with valid coordinates")
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
            print(f"  [OK] Loading real planting sites from {filepath.name}")
            df = pd.read_csv(filepath)
            # Columns: Latitude, Longitude, Statut, Etat_site, Type_emp, etc.
            if 'Latitude' in df.columns and 'Longitude' in df.columns:
                # Filter out invalid coordinates
                df = df.dropna(subset=['Latitude', 'Longitude'])
                df = df[(df['Latitude'] != 0) & (df['Longitude'] != 0)]
                geometry = [Point(lon, lat) for lon, lat in zip(df.Longitude, df.Latitude)]
                gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
                print(f"    Loaded {len(gdf)} planting sites with valid coordinates")
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
            print(f"  [OK] Loading real canopy data from {filepath.name}")
            gdf = gpd.read_file(filepath)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading canopy: {e}")
    
    # Try shapefile
    shp_path = DATA_RAW / 'canopy.shp'
    if shp_path.exists():
        try:
            print(f"  [OK] Loading real canopy data from {shp_path.name}")
            gdf = gpd.read_file(shp_path)
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading canopy: {e}")
    
    return None

def load_vulnerability_data():
    """Load vulnerability data from GeoJSON file or return None"""
    # Check for direct GeoJSON file first
    filepath = DATA_RAW / 'vulnerability.geojson'
    if filepath.exists():
        try:
            print(f"  [OK] Loading real vulnerability data from {filepath.name}")
            gdf = gpd.read_file(filepath)
            print(f"    Loaded {len(gdf)} vulnerability zones")
            return gdf
        except Exception as e:
            print(f"  ✗ Error loading vulnerability: {e}")
    
    # Check for unzipped folder
    vuln_dir = DATA_RAW / 'vulnerability'
    if vuln_dir.exists():
        for ext in ['.geojson', '.shp', '.gpkg']:
            files = list(vuln_dir.glob(f'*{ext}'))
            if files:
                try:
                    print(f"  [OK] Loading real vulnerability data from {files[0].name}")
                    gdf = gpd.read_file(files[0])
                    print(f"    Loaded {len(gdf)} vulnerability zones")
                    return gdf
                except Exception as e:
                    print(f"  ✗ Error loading vulnerability: {e}")
    return None

# Live API functions

def fetch_entraves_realtime():
    """Fetch real-time traffic closures (entraves) from live API"""
    import requests
    
    # Try direct Montréal Open Data API
    # Alternative URL from Montreal's open data portal
    urls_to_try = [
        "https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=a2bc8014-488c-495d-941b-e7ae1999d1bd&limit=1000",
        "https://donnees.montreal.ca/dataset/5b9a9a89-8c83-4e7b-a421-89b6f39f1ab3/resource/a2bc8014-488c-495d-941b-e7ae1999d1bd/download/entraves.json"
    ]
    
    for url in urls_to_try:
        try:
            print(f"  → Fetching live entraves data from {url[:50]}...")
            response = requests.get(url, timeout=10)
            if response.ok:
                data = response.json()
                
                # Handle different response formats
                if 'result' in data and 'records' in data['result']:
                    records = data['result']['records']
                elif isinstance(data, list):
                    records = data
                else:
                    records = []
                
                if records:
                    print(f"  ✓ Fetched {len(records)} active entraves")
                    return records
        except Exception as e:
            print(f"  ✗ Error with this URL: {e}")
            continue
    
    print("  ⚠ Could not fetch live entraves data (not critical)")
    return None

def check_data_availability():
    """Print a summary of available data files"""
    print("\n=== Data Availability Check ===")
    
    files_to_check = {
        'Air Quality': 'air_quality.csv',
        'Heat Islands': 'heat_islands.geojson',
        'Noise': 'noise.csv',
        'Traffic Segments': 'traffic_segments.csv',
        'Travel Times': 'travel_times.csv',
        'Trees': 'trees.csv',
        'Planting Sites': 'planting_sites.csv',
        'Canopy': 'canopy.geojson',
        'Vulnerability': 'vulnerability.geojson',
    }
    
    for name, filename in files_to_check.items():
        path = DATA_RAW / filename
        status = "[OK] FOUND" if path.exists() else "[X] MISSING (will use simulated data)"
        print(f"{name:20s}: {status}")
    
    print("\nTo download real data, see: data/README.md")
    print("=" * 50 + "\n")

