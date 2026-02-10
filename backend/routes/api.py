"""
Public API routes for tasks
"""
from flask import Blueprint, jsonify, request
from services.task_service import TaskService

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    try:
        tasks = TaskService.get_all_tasks()
        return jsonify({
            'success': True,
            'tasks': tasks,
            'total': len(tasks)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/tasks/by-date', methods=['GET'])
def get_tasks_by_date():
    """
    Get tasks grouped by date
    Query params:
        - year: Filter by year (optional)
    """
    try:
        year = request.args.get('year', type=int)
        tasks_by_date = TaskService.get_tasks_by_date(year)

        return jsonify({
            'success': True,
            'data': tasks_by_date,
            'total_dates': len(tasks_by_date)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/tasks/counts', methods=['GET'])
def get_task_counts():
    """
    Get count of tasks per date
    Query params:
        - year: Filter by year (optional)
    """
    try:
        year = request.args.get('year', type=int)
        counts = TaskService.get_task_counts_by_date(year)

        return jsonify({
            'success': True,
            'data': counts
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/tasks/upcoming', methods=['GET'])
def get_upcoming_tasks():
    """
    Get upcoming tasks (from today onwards)
    Query params:
        - limit: Number of tasks to return (optional)
    """
    try:
        limit = request.args.get('limit', type=int)
        tasks = TaskService.get_upcoming_tasks(limit)

        return jsonify({
            'success': True,
            'tasks': tasks,
            'total': len(tasks)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/tasks/date/<date_str>', methods=['GET'])
def get_tasks_for_date(date_str):
    """Get tasks for a specific date (format: YYYY-MM-DD)"""
    try:
        tasks = TaskService.get_tasks_for_date(date_str)

        return jsonify({
            'success': True,
            'date': date_str,
            'tasks': tasks,
            'total': len(tasks)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@api_bp.route('/departments', methods=['GET'])
def get_departments():
    """Get list of all departments"""
    try:
        departments = TaskService.get_departments()

        return jsonify({
            'success': True,
            'departments': departments,
            'total': len(departments)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get general statistics"""
    try:
        date_range = TaskService.get_date_range()
        departments = TaskService.get_departments()
        all_tasks = TaskService.get_all_tasks()

        return jsonify({
            'success': True,
            'stats': {
                'total_tasks': len(all_tasks),
                'total_departments': len(departments),
                'date_range': date_range
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
