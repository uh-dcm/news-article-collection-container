"""
This searches db for specific queries, called by app.py.
"""
import os
import time
from flask import jsonify, request
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError
from config import FETCHER_FOLDER
from log_config import logger

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def search_articles(engine):
    # wait for collect.py and process.py to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    try:
        # check whether the table exists
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 400

        search_query = request.args.get('searchQuery', '')
        # Datetime object used instead of string to achieve proper sorting in table
        stmt = text("""
            SELECT DATETIME(time) as time, url, full_text 
            FROM articles 
            WHERE full_text LIKE :word 
            COLLATE utf8_general_ci
            ORDER BY time DESC
        """)
        stmt = stmt.bindparams(word=f'%{search_query}%')
        result = engine.connect().execute(stmt)
        rows = result.fetchall()
        data = [{"time": time, "url": url, "full_text": full_text} for time, url, full_text in rows]
        return jsonify(data), 200
    except SQLAlchemyError as e:
        logger.error(f"Database error when searching: {e}")
        return jsonify({"status": "error", "message": f"Database error when searching: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Error when searching articles: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
