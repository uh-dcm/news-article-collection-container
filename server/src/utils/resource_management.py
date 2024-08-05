"""
This handles resource management related utilities, related to db and scheduling.
"""
from flask_apscheduler import APScheduler
from sqlalchemy import create_engine, inspect
from flask import jsonify, current_app

def init_scheduler(app, testing=False):
    """Initializes and starts the application scheduler. Used by app.py."""
    app.scheduler = APScheduler()
    app.scheduler.init_app(app)
    if not testing:
        app.scheduler.start()

def init_db_engine(app):
    """Creates the database engine. Used by app.py."""
    if not hasattr(app, 'db_engine'):
        app.db_engine = create_engine(app.config['DATABASE_URL'], echo=False)

def shutdown_scheduler(app):
    """Shuts down scheduler. Used by app.py when teardown happens."""
    if hasattr(app, 'scheduler') and app.scheduler.running:
        app.scheduler.shutdown()

def dispose_engine(app):
    """Disposes of database engine. Used by app.py when teardown happens."""
    if hasattr(app, 'db_engine'):
        app.db_engine.dispose()

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
