"""
CityPulse Montréal 2035 - Flask API
Main application entry point
"""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True') == 'True'
app.config['DATA_DIR'] = os.getenv('DATA_DIR', 'data')
app.config['GRID_FILE'] = os.getenv('GRID_FILE', 'data/processed/citypulse_grid.geojson')

# Import API routes
from api import grid, cells, scenarios

# Register blueprints
app.register_blueprint(grid.bp)
app.register_blueprint(cells.bp)
app.register_blueprint(scenarios.bp)

@app.route('/')
def index():
    return {
        'message': 'CityPulse Montréal 2035 API',
        'version': '1.0',
        'endpoints': [
            '/api/grid',
            '/api/hotspots',
            '/api/cell/<id>',
            '/api/trees',
            '/api/planting-sites',
            '/api/scenario/summary'
        ]
    }

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])

