"""
This has basic database engine setup. Follows the setup of rss-fetcher/database.py.
Engine used by export_manager.py, query.processor.py and stats_analyzer.py.
Processing status, related to DB use, needed by content_fetcher.py,
export_manager.py and app.py.
Split into its own file for testing import purposes.
"""
from sqlalchemy import create_engine
from flask import current_app

# update in the next commit

def get_engine():
    """
    Returns the engine, and creates it if it doesn't exist.
    """
    if not hasattr(current_app, 'db_engine'):
        current_app.db_engine = create_engine(current_app.config['DATABASE_URL'], echo=False)
    return current_app.db_engine

class ProcessingStatus:
    """
    Downloads end faulty if let to run while DB is getting updated
    by processing, so this makes downloads wait.
    """
    _status = False

    @classmethod
    def set_status(cls, status):
        """
        Setting processing status. Used by content_fetcher.py.
        """
        cls._status = status

    @classmethod
    def get_status(cls):
        """
        Getting processing status. Used by content_fetcher.py,
        export_manager.py and app.py.
        """
        return cls._status
