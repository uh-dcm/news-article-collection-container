"""
This handles resource management related utilities, related to db and scheduling.
"""
from flask_apscheduler import APScheduler
from sqlalchemy import create_engine, inspect
from flask import jsonify, current_app

# used in content_fetcher.py
scheduler = APScheduler()

def init_scheduler(app, testing=False):
    """Initializes and starts the application scheduler. Used by app.py."""
    scheduler.init_app(app)
    app.scheduler = scheduler
    if not testing:
        scheduler.start()

def init_db_engine(app):
    """Creates the database engine. Used by app.py."""
    if not hasattr(app, 'db_engine'):
        app.db_engine = create_engine(app.config['DATABASE_URL'], echo=False)

def check_articles_table():
    """
    Checks if the articles table exists in the database.
    Used by query_processor.py, stats_analyzer.py and export_manager.py.
    """
    inspector = inspect(current_app.db_engine)
    if not inspector.has_table('articles'):
        return jsonify({
            "status": "error",
            "message": "No articles found. Please fetch the articles first."
        }), 404
    return None
