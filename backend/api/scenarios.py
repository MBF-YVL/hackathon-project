"""
Scenario API endpoints
Handles scenario planning and narrative generation
"""
from flask import Blueprint, request, jsonify
import json

bp = Blueprint('scenarios', __name__, url_prefix='/api')

@bp.route('/scenario/summary', methods=['POST'])
def scenario_summary():
    """
    Generate a narrative summary for a 2035 scenario
    Request body:
    {
        "car": -0.3,
        "transit": 0.5,
        "trees": 0.6,
        "aggregate_metrics": {
            "avg_csi_current": 60,
            "avg_csi_scenario": 40,
            "hotspot_count_current": 20,
            "hotspot_count_scenario": 8
        }
    }
    """
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

