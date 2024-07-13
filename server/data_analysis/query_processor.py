"""
This searches db for specific queries. Called by app.py.
"""
from flask import jsonify, request, current_app
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError

from db_config import engine
from log_config import logger

def get_search_results():
    """
    Searches db articles for a custom user query.
    Called by app.get_search_results_route().
    """
    try:
        # check whether the table exists
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 404

        search_query = request.args.get('searchQuery', '')
        # Datetime object used instead of string to achieve proper sorting in table
        stmt = text("""
            SELECT id, DATETIME(time) as time, url, full_text
            FROM articles 
            WHERE full_text LIKE :word 
            COLLATE utf8_general_ci
            ORDER BY time DESC
        """)
        stmt = stmt.bindparams(word=f'%{search_query}%')

        with engine.connect() as connection:
            result = connection.execute(stmt)
            rows = result.fetchall()

        data = [{"time": time, "url": url, "full_text": full_text} for _, time, url, full_text in rows]
        current_app.last_search_ids = [row[0] for row in rows]

        return jsonify(data), 200
    except SQLAlchemyError as e:
        logger.error("Database error when searching: %s", e)
        return jsonify({"status": "error", "message": f"Database error when searching: {str(e)}"}), 500
    except Exception as e:
        logger.error("Error when searching: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
