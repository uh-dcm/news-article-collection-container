"""
This has basic database engine setup. Follows the setup of rss-fetcher/database.py.
Used by export_manager.py, query.processor.py and stats_analyzer.py.
Split into its own file for testing import purposes.
"""
from sqlalchemy import create_engine
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=False)
