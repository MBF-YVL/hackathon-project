"""
Download Datasets
Downloads all required datasets from Montreal Open Data and other sources
"""
import os
import requests
from pathlib import Path

# Base directories
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data' / 'raw'

# Dataset URLs (to be populated with actual resource URLs)
DATASETS = {
    'air_quality': {
        'url': 'https://donnees.montreal.ca/dataset/rsqa-polluants-gazeux',
        'file': 'air_quality.csv',
        'type': 'csv'
    },
    'heat_islands': {
        'url': 'https://donnees.montreal.ca/dataset/ilots-de-chaleur',
        'file': 'heat_islands.geojson',
        'type': 'geojson'
    },
    'noise': {
        'url': 'https://donnees.montreal.ca/dataset/mesures-niveaux-acoustiques',
        'file': 'noise.csv',
        'type': 'csv'
    },
    'traffic_segments': {
        'url': 'https://donnees.montreal.ca/dataset/segments-routiers-de-collecte-des-temps-de-parcours',
        'file': 'traffic_segments.geojson',
        'type': 'geojson'
    },
    'travel_times': {
        'url': 'https://donnees.montreal.ca/dataset/temps-de-parcours-sur-des-segments-routiers-historique',
        'file': 'travel_times.csv',
        'type': 'csv'
    },
    'trees': {
        'url': 'https://donnees.montreal.ca/dataset/arbres',
        'file': 'trees.csv',
        'type': 'csv'
    },
    'planting_sites': {
        'url': 'https://donnees.montreal.ca/dataset/emplacements-arbres',
        'file': 'planting_sites.csv',
        'type': 'csv'
    },
    'canopy': {
        'url': 'https://donnees.montreal.ca/dataset/canopee',
        'file': 'canopy.geojson',
        'type': 'geojson'
    },
    'vulnerability': {
        'url': 'https://donnees.montreal.ca/dataset/vulnerabilite-changements-climatiques',
        'file': 'vulnerability.zip',
        'type': 'zip'
    }
}

def download_file(url: str, output_path: Path, force: bool = False):
    """Download a file from URL to output path"""
    if output_path.exists() and not force:
        print(f"✓ {output_path.name} already exists, skipping")
        return True
    
    print(f"Downloading {output_path.name}...")
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✓ Downloaded {output_path.name}")
        return True
    
    except Exception as e:
        print(f"✗ Error downloading {output_path.name}: {e}")
        return False

def create_sample_data():
    """Create sample/placeholder data files for development"""
    print("\n=== Creating sample data files ===")
    print("Note: These are placeholders. Replace with actual data downloads.")
    
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create placeholder CSV files
    csv_files = ['air_quality.csv', 'noise.csv', 'travel_times.csv', 'trees.csv', 'planting_sites.csv']
    for filename in csv_files:
        filepath = DATA_DIR / filename
        if not filepath.exists():
            with open(filepath, 'w') as f:
                f.write("# Placeholder - replace with actual data\n")
            print(f"✓ Created placeholder {filename}")
    
    # Create placeholder GeoJSON files
    geojson_template = '{"type": "FeatureCollection", "features": []}'
    geojson_files = ['heat_islands.geojson', 'traffic_segments.geojson', 'canopy.geojson']
    for filename in geojson_files:
        filepath = DATA_DIR / filename
        if not filepath.exists():
            with open(filepath, 'w') as f:
                f.write(geojson_template)
            print(f"✓ Created placeholder {filename}")
    
    print("\nSample data files created. Ready for ETL processing.")

def download_all(force: bool = False):
    """Download all datasets"""
    print("=== Montreal Open Data Downloader ===")
    print("\nIMPORTANT: This script uses placeholder URLs.")
    print("To download actual data:")
    print("1. Visit each dataset page listed in PRD.md")
    print("2. Find the direct resource URL (CSV/GeoJSON/ZIP)")
    print("3. Update the DATASETS dictionary in this script")
    print("4. Run again with actual URLs\n")
    
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    total_count = len(DATASETS)
    
    for name, info in DATASETS.items():
        output_path = DATA_DIR / info['file']
        print(f"\n{name}:")
        print(f"  Dataset page: {info['url']}")
        print(f"  Output: {output_path}")
        print(f"  Status: Manual download required (visit dataset page)")
    
    print(f"\n=== Download Summary ===")
    print(f"Datasets listed: {total_count}")
    print(f"Manual download required for all datasets")
    print(f"\nFor hackathon development, creating sample data...")
    
    create_sample_data()

if __name__ == '__main__':
    download_all()

