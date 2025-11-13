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
        if os.path.exists(grid_file):
            _grid_cache = gpd.read_file(grid_file)
        else:
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
        
        if isinstance(grid_data, dict):
            return jsonify(grid_data)
        
        if scenario == '2035' or car != 0 or trees != 0 or transit != 0:
            from scenario_engine import apply_scenario_adjustments
            grid_data = apply_scenario_adjustments(grid_data.copy(), car, trees, transit)
        
        geojson = json.loads(grid_data.to_json())
        return jsonify(geojson)
    
    except Exception as e:
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

