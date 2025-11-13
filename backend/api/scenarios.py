"""Scenario API endpoints - Handles scenario planning and narrative generation"""
from flask import Blueprint, request, jsonify
import json

bp = Blueprint('scenarios', __name__, url_prefix='/api')

@bp.route('/scenario/summary', methods=['POST'])
def scenario_summary():
    """Generate AI narrative summary for a 2035 scenario"""
    try:
        from ai_services import generate_scenario_narrative
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        car = data.get('car', 0)
        transit = data.get('transit', 0)
        trees = data.get('trees', 0)
        metrics = data.get('aggregate_metrics', {})
        
        narrative = generate_scenario_narrative(car, transit, trees, metrics)
        
        return jsonify({'narrative': narrative})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

