"""
Admin routes for authentication and data import
"""
from flask import Blueprint, jsonify, request, session
from models import User, db
from auth import admin_required
from services.excel_processor import ExcelProcessor
from utils.helpers import save_uploaded_file, cleanup_file

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'error': 'Username and password required'
            }), 400

        username = data['username']
        password = data['password']

        # Find user
        user = User.query.filter_by(username=username).first()

        if not user or not user.check_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid credentials'
            }), 401

        # Check if user is admin
        if user.role != 'admin':
            return jsonify({
                'success': False,
                'error': 'Admin access required'
            }), 403

        # Set session
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        session.permanent = True

        return jsonify({
            'success': True,
            'user': user.to_dict()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@admin_bp.route('/logout', methods=['POST'])
def logout():
    """Admin logout endpoint"""
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    })


@admin_bp.route('/me', methods=['GET'])
@admin_required
def get_current_user():
    """Get current logged in user"""
    try:
        user = User.query.get(session['user_id'])
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@admin_bp.route('/import', methods=['POST'])
@admin_required
def import_tasks():
    """
    Import tasks from Excel file
    Expects multipart/form-data with 'file' field
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        # Save uploaded file
        file_path = save_uploaded_file(file)

        if not file_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Only .xlsx and .xls files are allowed'
            }), 400

        # Process Excel file
        processor = ExcelProcessor()

        try:
            # Parse Excel
            tasks = processor.parse_excel(file_path)

            if not tasks:
                return jsonify({
                    'success': False,
                    'error': 'No valid tasks found in Excel file',
                    'errors': processor.get_errors()
                }), 400

            # Merge with existing data
            stats = processor.merge_tasks(tasks)

            # Clean up uploaded file
            cleanup_file(file_path)

            return jsonify({
                'success': True,
                'message': 'Import completed successfully',
                'stats': stats,
                'errors': processor.get_errors()
            })

        except Exception as e:
            # Clean up on error
            cleanup_file(file_path)
            raise e

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Import failed: {str(e)}'
        }), 500


@admin_bp.route('/preview', methods=['POST'])
@admin_required
def preview_import():
    """
    Preview Excel file before import
    Returns statistics about the file without saving to database
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        # Save uploaded file temporarily
        file_path = save_uploaded_file(file)

        if not file_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file type'
            }), 400

        # Parse Excel (without saving to DB)
        processor = ExcelProcessor()

        try:
            tasks = processor.parse_excel(file_path)

            # Get preview statistics
            departments = set()
            dates = []

            for task in tasks:
                departments.add(task['department'])
                if task['warning_date']:
                    dates.append(task['warning_date'])

            preview_data = {
                'total_tasks': len(tasks),
                'departments': sorted(list(departments)),
                'total_departments': len(departments),
                'date_range': {
                    'min': min(dates).isoformat() if dates else None,
                    'max': max(dates).isoformat() if dates else None
                },
                'sample_tasks': tasks[:5]  # First 5 tasks as sample
            }

            # Clean up
            cleanup_file(file_path)

            return jsonify({
                'success': True,
                'preview': preview_data,
                'stats': processor.get_stats(),
                'errors': processor.get_errors()
            })

        except Exception as e:
            cleanup_file(file_path)
            raise e

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Preview failed: {str(e)}'
        }), 500


@admin_bp.route('/change-password', methods=['POST'])
@admin_required
def change_password():
    """Change admin password"""
    try:
        data = request.get_json()

        if not data or 'current_password' not in data or 'new_password' not in data:
            return jsonify({
                'success': False,
                'error': 'Current and new password required'
            }), 400

        user = User.query.get(session['user_id'])

        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({
                'success': False,
                'error': 'Current password is incorrect'
            }), 401

        # Set new password
        user.set_password(data['new_password'])
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
