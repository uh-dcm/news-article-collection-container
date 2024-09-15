"""
Handles log routes. Called by routes.py.
"""
from flask import jsonify

def get_error_log(log_file_path):
    """
    Returns jsonified error log.
    Called by routes.init_routes() for route /api/error_log.
    """
    try:
        with open(log_file_path, 'r', encoding='utf-8') as log_file:
            log_records = log_file.read()
        return jsonify(log=log_records.splitlines()), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch log", "details": str(e)}), 500

def clear_error_log(log_file_path):
    """
    Clears error log.
    Called by routes.init_routes() for route /api/clear_error_log.
    """
    try:
        with open(log_file_path, 'w', encoding='utf-8') as log_file:
            log_file.write('')
        return jsonify({"message": "Log cleared successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to clear log", "details": str(e)}), 500
