"""
This searches db for specific queries. Called by app.py.
"""
from datetime import datetime, timedelta
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

        # params
        text_query = request.args.get('textQuery', '')
        url_query = request.args.get('urlQuery', '')
        start_time = request.args.get('startTime', '')
        end_time = request.args.get('endTime', '')
        html_query = request.args.get('htmlQuery', '')

        # base query
        # Datetime object used instead of string to achieve proper sorting in table
        query = """
            SELECT id, DATETIME(time) as time, url, full_text
            FROM articles 
            WHERE 1=1
        """
        params = {}

        if text_query:
            if text_query == "*No full text available.*":
                query += " AND (full_text IS NULL OR full_text = '')"
            else:
                query += " AND full_text LIKE :text_query"
                params['text_query'] = f'%{text_query}%'

        if url_query:
            query += " AND url LIKE :url_query"
            params['url_query'] = f'%{url_query}%'

        if start_time:
            parsed_start = parse_input_date(start_time, is_end_date=False)
            if parsed_start:
                query += " AND time >= :start_time"
                params['start_time'] = parsed_start

        if end_time:
            parsed_end = parse_input_date(end_time, is_end_date=True)
            if parsed_end:
                query += " AND time <= :end_time"
                params['end_time'] = parsed_end

        if html_query:
            query += " AND html LIKE :html_query"
            params['html_query'] = f'%{html_query}%'

        query += " ORDER BY time DESC"

        stmt = text(query)
        stmt = stmt.bindparams(**params)

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

def parse_input_date(date_string, is_end_date=False):
    """
    Checking the inputted time formatting and converting it to datetime.
    """
    formats = ["%Y", "%Y-%m", "%Y-%m-%d", "%Y-%m-%d %H", "%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"]
    for fmt in formats:
        try:
            date = datetime.strptime(date_string, fmt)
            if is_end_date:
                if fmt == "%Y":
                    date = date.replace(month=12, day=31, hour=23, minute=59, second=59)
                elif fmt == "%Y-%m":
                    next_month = date.replace(day=28) + timedelta(days=4)
                    last_day = next_month - timedelta(days=next_month.day)
                    date = date.replace(day=last_day.day, hour=23, minute=59, second=59)
                elif fmt == "%Y-%m-%d":
                    date = date.replace(hour=23, minute=59, second=59)
            return date
        except ValueError:
            pass
    return None
