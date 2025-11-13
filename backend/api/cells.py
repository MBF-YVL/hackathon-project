"""Cell API endpoints - Handles requests for individual cell details"""
from flask import Blueprint, jsonify, request, current_app
import json
import os

bp = Blueprint('cells', __name__, url_prefix='/api')

@bp.route('/cell/<cell_id>', methods=['GET'])
def get_cell(cell_id):
    """Get detailed information for a specific cell including AI-generated summary"""
    try:
        from api.grid import load_grid_data
        from ai_services import generate_cell_summary
        
        # Get scenario parameters from query string
        car = float(request.args.get('car', 0.0))
        trees = float(request.args.get('trees', 0.0))
        transit = float(request.args.get('transit', 0.0))
        
        grid_data = load_grid_data()
        
        if isinstance(grid_data, dict):
            return jsonify({'error': 'Grid data not available'}), 404
        
        # Apply scenario adjustments if any parameters are set
        if car != 0 or trees != 0 or transit != 0:
            from scenario_engine import apply_scenario_adjustments
            grid_data = apply_scenario_adjustments(grid_data.copy(), car, trees, transit)
        
        # Find the cell
        cell = grid_data[grid_data['id'] == cell_id]
        
        if cell.empty:
            return jsonify({'error': f'Cell {cell_id} not found'}), 404
        
        cell_row = cell.iloc[0]
        
        # Extract metrics
        metrics = {
            'csi_current': float(cell_row.get('csi_current', 0)),
            'csi_scenario': float(cell_row.get('csi_scenario', 0)),
            'air_stress': float(cell_row.get('air_stress', 0)),
            'heat_stress': float(cell_row.get('heat_stress', 0)),
            'noise_stress': float(cell_row.get('noise_stress', 0)),
            'traffic_stress': float(cell_row.get('traffic_stress', 0)),
            'crowding_stress': float(cell_row.get('crowding_stress', 0)),
            'vulnerability_factor': float(cell_row.get('vulnerability_factor', 0))
        }
        
        # Extract interventions
        interventions = {
            'trees': {
                'score': float(cell_row.get('tree_score', 0)),
                'recommended_count': int(cell_row.get('tree_count', 0)),
                'expected_delta_csi': int(cell_row.get('tree_delta_csi', 0))
            },
            'car_limits': {
                'type': cell_row.get('car_limit_type', 'none'),
                'score': float(cell_row.get('car_limit_score', 0)),
                'expected_delta_csi': int(cell_row.get('car_limit_delta_csi', 0))
            },
            'transit': {
                'type': cell_row.get('transit_type', 'none'),
                'score': float(cell_row.get('transit_score', 0)),
                'expected_delta_csi': int(cell_row.get('transit_delta_csi', 0))
            }
        }
        
        # Generate AI summary
        summary = generate_cell_summary(cell_id, metrics, interventions)
        
        return jsonify({
            'id': cell_id,
            'metrics': metrics,
            'interventions': interventions,
            'summary': summary
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/hotspots', methods=['GET'])
def get_hotspots():
    """Get identified stress hotspots (CSI > 70)"""
    try:
        from api.grid import load_grid_data
        import numpy as np
        
        grid_data = load_grid_data()
        
        if isinstance(grid_data, dict):
            return jsonify([])
        
        threshold = 60
        hotspot_cells = grid_data[grid_data['csi_current'] > threshold]
        
        if hotspot_cells.empty:
            return jsonify([])
        
        hotspots = []
        hotspot_id = 1
        
        for idx, cell in hotspot_cells.iterrows():
            centroid = cell.geometry.centroid
            
            hotspots.append({
                'id': f'hotspot_{hotspot_id}',
                'centroid': {
                    'lat': centroid.y,
                    'lng': centroid.x
                },
                'avg_csi': float(cell['csi_current']),
                'top_drivers': get_top_drivers(cell),
                'avg_vulnerability': float(cell.get('vulnerability_factor', 0)),
                'cell_ids': [cell['id']]
            })
            hotspot_id += 1
        
        return jsonify(hotspots)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_top_drivers(cell):
    """Identify top 2-3 stress drivers for a cell"""
    drivers = {
        'air': cell.get('air_stress', 0),
        'heat': cell.get('heat_stress', 0),
        'noise': cell.get('noise_stress', 0),
        'traffic': cell.get('traffic_stress', 0),
        'crowding': cell.get('crowding_stress', 0)
    }
    
    sorted_drivers = sorted(drivers.items(), key=lambda x: x[1], reverse=True)
    return [d[0] for d in sorted_drivers[:3] if d[1] > 0.5]

