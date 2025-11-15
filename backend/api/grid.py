"""Grid API endpoints - Handles requests for CSI grid data"""
import json
import os
from flask import Blueprint, request, jsonify, current_app
import geopandas as gpd

bp = Blueprint('grid', __name__, url_prefix='/api')

_grid_cache = None

def load_grid_data():
    """Load and cache grid GeoJSON"""
    global _grid_cache
    if _grid_cache is None:
        grid_file = current_app.config['GRID_FILE']
        # Resolve relative paths from backend directory
        if not os.path.isabs(grid_file):
            from pathlib import Path
            backend_dir = Path(__file__).parent.parent
            grid_file = str(backend_dir / grid_file)
        
        if os.path.exists(grid_file):
            try:
                _grid_cache = gpd.read_file(grid_file)
                print(f"Loaded grid: {len(_grid_cache)} cells from {grid_file}")
            except Exception as e:
                print(f"Error loading grid with geopandas: {e}")
                # Fallback for Windows when fiona/pyogrio not available
                from shapely.geometry import shape
                with open(grid_file, 'r', encoding='utf-8') as f:
                    geojson = json.load(f)
                features = []
                for feature in geojson['features']:
                    geom = shape(feature['geometry'])
                    props = feature['properties']
                    features.append({**props, 'geometry': geom})
                _grid_cache = gpd.GeoDataFrame(features, crs='EPSG:4326')
                print(f"Loaded grid (fallback): {len(_grid_cache)} cells")
        else:
            print(f"Grid file not found: {grid_file}")
            return {"type": "FeatureCollection", "features": []}
    return _grid_cache

@bp.route('/grid', methods=['GET'])
def get_grid():
    """Get grid data with CSI metrics and optional scenario adjustments"""
    try:
        scenario = request.args.get('scenario', 'current')
        car = float(request.args.get('car', 0.0))
        trees = float(request.args.get('trees', 0.0))
        transit = float(request.args.get('transit', 0.0))
        
        grid_data = load_grid_data()
        
        # If load_grid_data returned empty dict, return it
        if isinstance(grid_data, dict):
            return jsonify(grid_data)
        
        # If grid_data is None or empty GeoDataFrame, return empty
        if grid_data is None or (hasattr(grid_data, 'empty') and grid_data.empty):
            return jsonify({"type": "FeatureCollection", "features": []})
        
        if scenario == '2035' or car != 0 or trees != 0 or transit != 0:
            from scenario_engine import apply_scenario_adjustments
            grid_data = apply_scenario_adjustments(grid_data.copy(), car, trees, transit)
        
        # Convert GeoDataFrame to GeoJSON
        geojson = json.loads(grid_data.to_json())
        
        # Ensure it's a valid FeatureCollection
        if 'features' not in geojson or len(geojson['features']) == 0:
            print(f"Warning: GeoJSON has no features. Grid data type: {type(grid_data)}, length: {len(grid_data) if hasattr(grid_data, '__len__') else 'N/A'}")
        
        return jsonify(geojson)
    
    except Exception as e:
        import traceback
        print(f"Error in get_grid: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@bp.route('/trees', methods=['GET'])
def get_trees():
    """Get tree locations"""
    try:
        trees_file = os.path.join(current_app.config['DATA_DIR'], 'processed', 'trees.geojson')
        if os.path.exists(trees_file):
            with open(trees_file, 'r') as f:
                return jsonify(json.load(f))
        else:
            return jsonify({"type": "FeatureCollection", "features": []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/planting-sites', methods=['GET'])
def get_planting_sites():
    """Get potential tree planting sites"""
    try:
        sites_file = os.path.join(current_app.config['DATA_DIR'], 'processed', 'planting_sites.geojson')
        if os.path.exists(sites_file):
            with open(sites_file, 'r') as f:
                return jsonify(json.load(f))
        else:
            return jsonify({"type": "FeatureCollection", "features": []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/reload', methods=['POST'])
def reload_grid():
    """Force reload of grid data from disk"""
    global _grid_cache
    _grid_cache = None
    load_grid_data()
    return jsonify({'message': 'Grid data reloaded successfully'})
