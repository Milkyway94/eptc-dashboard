"""
Database models for the application
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()


class Task(db.Model):
    """Task/Warning model"""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    stt = db.Column(db.Integer, nullable=True)  # Số thứ tự từ Excel
    department = db.Column(db.String(200), nullable=False, index=True)  # Phòng chủ trì
    content = db.Column(db.Text, nullable=False)  # Nội dung cảnh báo
    warning_date = db.Column(db.Date, nullable=True, index=True)  # Ngày cảnh báo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert task to dictionary"""
        return {
            'id': self.id,
            'stt': self.stt,
            'department': self.department,
            'content': self.content,
            'warning_date': self.warning_date.isoformat() if self.warning_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Task {self.id}: {self.department} - {self.warning_date}>'


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='viewer')  # 'admin' or 'viewer'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        """Convert user to dictionary (without password)"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.username} ({self.role})>'


def init_db(app):
    """Initialize database and create default admin user"""
    with app.app_context():
        db.create_all()

        # Create default admin user if not exists
        admin = User.query.filter_by(username=app.config['DEFAULT_ADMIN_USERNAME']).first()
        if not admin:
            admin = User(
                username=app.config['DEFAULT_ADMIN_USERNAME'],
                role='admin'
            )
            admin.set_password(app.config['DEFAULT_ADMIN_PASSWORD'])
            db.session.add(admin)
            db.session.commit()
            print(f"Created default admin user: {app.config['DEFAULT_ADMIN_USERNAME']}")
