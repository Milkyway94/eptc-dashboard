"""
Flask application entry point
"""
import os
from flask import Flask, session, jsonify
from flask_cors import CORS
from config import config
from models import db, init_db
from routes.api import api_bp
from routes.admin import admin_bp


def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    db.init_app(app)

    # Initialize database
    init_db(app)

    # Register blueprints
    app.register_blueprint(api_bp)
    app.register_blueprint(admin_bp)

    # Health check endpoint
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'message': 'EPTC Heatmap API is running'
        })

    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'name': 'EPTC Heatmap Dashboard API',
            'version': '1.0.0',
            'endpoints': {
                'public': {
                    'GET /api/tasks': 'Get all tasks',
                    'GET /api/tasks/by-date?year=YYYY': 'Get tasks grouped by date',
                    'GET /api/tasks/counts?year=YYYY': 'Get task counts per date',
                    'GET /api/tasks/upcoming?limit=N': 'Get upcoming tasks',
                    'GET /api/tasks/date/<date>': 'Get tasks for specific date',
                    'GET /api/departments': 'Get all departments',
                    'GET /api/stats': 'Get general statistics'
                },
                'admin': {
                    'POST /api/admin/login': 'Admin login',
                    'POST /api/admin/logout': 'Admin logout',
                    'GET /api/admin/me': 'Get current user',
                    'POST /api/admin/import': 'Import tasks from Excel',
                    'POST /api/admin/preview': 'Preview Excel before import',
                    'POST /api/admin/change-password': 'Change password'
                }
            }
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Endpoint not found'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

    return app


# Create app instance for gunicorn
config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    # Get host and port from environment
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    # Railway uses PORT, fallback to FLASK_PORT or 5000
    port = int(os.environ.get('PORT', os.environ.get('FLASK_PORT', 5000)))

    print(f"Starting EPTC Heatmap Dashboard API...")
    print(f"Environment: {config_name}")
    print(f"Server: http://{host}:{port}")
    print(f"Default admin credentials: admin / admin123")
    print(f"Please change the default password after first login!")

    app.run(host=host, port=port, debug=(config_name == 'development'))
