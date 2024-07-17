"""
This searches db for specific queries. Called by app.py.
"""
from datetime import datetime, timedelta
import re
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
            parsed_query, query_params = parse_operators(text_query, 'full_text')
            query += f" AND ({parsed_query})"
            params.update(query_params)

        if url_query:
            parsed_query, query_params = parse_operators(url_query, 'url')
            query += f" AND ({parsed_query})"
            params.update(query_params)

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
            parsed_query, query_params = parse_operators(html_query, 'html')
            query += f" AND ({parsed_query})"
            params.update(query_params)

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

def parse_operators(query, column):
    """
    Parses operators #AND#, #OR# and #NOT# in full text, URL
    and HTML queries. #ESC# enables escaping % and _. Also uses
    special query #NOTEXT# for articles without full text.
    """
    parts = re.split(r'(#AND#|#OR#|#NOT#)', query)
    sql_parts = []
    query_params = {}
    negate_next = False
    for i, part in enumerate(parts):
        if part == "#AND#":
            sql_parts.append('AND')
        elif part == "#OR#":
            sql_parts.append('OR')
        elif part == "#NOT#":
            negate_next = True
        else:
            part = part.strip()
            if part:
                if part == "#NOTEXT#":
                    condition = f"({column} IS NULL OR {column} = '')"
                else:
                    param_name = f'{column}_query_{i}'
                    if '#ESC#' in part:
                        condition = f"{column} LIKE :{param_name} ESCAPE '\\'"
                        esc_part = part.replace('#ESC#%', r'\%').replace('#ESC#_', r'\_')
                    else:
                        condition = f"{column} LIKE :{param_name}"
                        esc_part = part
                    query_params[param_name] = f'%{esc_part}%'
                if negate_next:
                    sql_parts.append(f"NOT ({condition})")
                    negate_next = False
                else:
                    sql_parts.append(condition)
    return ' '.join(sql_parts) if sql_parts else "1=1", query_params

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
