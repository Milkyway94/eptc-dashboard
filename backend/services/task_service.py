"""
Task business logic service
"""
from datetime import datetime, date
from collections import defaultdict
from models import Task


class TaskService:
    """Service for task-related operations"""

    @staticmethod
    def get_all_tasks():
        """Get all tasks"""
        tasks = Task.query.all()
        return [task.to_dict() for task in tasks]

    @staticmethod
    def get_tasks_by_date(year=None):
        """
        Get tasks grouped by date
        Returns dictionary: { 'YYYY-MM-DD': [task1, task2, ...] }
        """
        query = Task.query.filter(Task.warning_date.isnot(None))

        if year:
            start_date = date(year, 1, 1)
            end_date = date(year, 12, 31)
            query = query.filter(
                Task.warning_date >= start_date,
                Task.warning_date <= end_date
            )

        tasks = query.all()

        # Group by date
        tasks_by_date = defaultdict(list)
        for task in tasks:
            date_key = task.warning_date.isoformat()
            tasks_by_date[date_key].append(task.to_dict())

        return dict(tasks_by_date)

    @staticmethod
    def get_upcoming_tasks(limit=None):
        """
        Get tasks from today onwards, sorted by date
        """
        today = date.today()

        query = Task.query.filter(
            Task.warning_date.isnot(None),
            Task.warning_date >= today
        ).order_by(Task.warning_date.asc())

        if limit:
            query = query.limit(limit)

        tasks = query.all()
        return [task.to_dict() for task in tasks]

    @staticmethod
    def get_tasks_for_date(target_date):
        """Get all tasks for a specific date"""
        if isinstance(target_date, str):
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()

        tasks = Task.query.filter(Task.warning_date == target_date).all()
        return [task.to_dict() for task in tasks]

    @staticmethod
    def get_task_counts_by_date(year=None):
        """
        Get count of tasks per date
        Returns dictionary: { 'YYYY-MM-DD': count }
        """
        query = Task.query.filter(Task.warning_date.isnot(None))

        if year:
            start_date = date(year, 1, 1)
            end_date = date(year, 12, 31)
            query = query.filter(
                Task.warning_date >= start_date,
                Task.warning_date <= end_date
            )

        tasks = query.all()

        # Count by date
        counts = defaultdict(int)
        for task in tasks:
            date_key = task.warning_date.isoformat()
            counts[date_key] += 1

        return dict(counts)

    @staticmethod
    def get_departments():
        """Get list of unique departments"""
        result = Task.query.with_entities(Task.department).distinct().all()
        return [dept[0] for dept in result]

    @staticmethod
    def get_date_range():
        """Get min and max dates from tasks"""
        min_date = Task.query.filter(Task.warning_date.isnot(None)).order_by(
            Task.warning_date.asc()
        ).first()

        max_date = Task.query.filter(Task.warning_date.isnot(None)).order_by(
            Task.warning_date.desc()
        ).first()

        return {
            'min_date': min_date.warning_date.isoformat() if min_date else None,
            'max_date': max_date.warning_date.isoformat() if max_date else None
        }
