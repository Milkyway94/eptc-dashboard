"""
Helper utilities
"""
import os
from werkzeug.utils import secure_filename
from flask import current_app


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def save_uploaded_file(file):
    """
    Save uploaded file to upload folder
    Returns the file path
    """
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)

        # Create upload folder if not exists
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)

        # Generate unique filename if file already exists
        base_name, extension = os.path.splitext(filename)
        counter = 1
        file_path = os.path.join(upload_folder, filename)

        while os.path.exists(file_path):
            filename = f"{base_name}_{counter}{extension}"
            file_path = os.path.join(upload_folder, filename)
            counter += 1

        file.save(file_path)
        return file_path

    return None


def cleanup_file(file_path):
    """Delete file if it exists"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
    return False
