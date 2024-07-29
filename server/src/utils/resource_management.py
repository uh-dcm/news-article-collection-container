"""
Utils related to db use.
"""
from flask import jsonify
from sqlalchemy import inspect
from configs.db_config import get_engine

# db and scheduler functions here in the next commit

def check_articles_table():
    """
    Checks if the articles table exists in the database.
    Used by query_processor.py, stats_analyzer.py and export_manager.py.
    """
    inspector = inspect(get_engine())
    if not inspector.has_table('articles'):
        return jsonify({
            "status": "error",
            "message": "No articles found. Please fetch the articles first."
        }), 404
    return None
