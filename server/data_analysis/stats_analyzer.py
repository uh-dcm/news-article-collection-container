"""
This returns statistics about db articles. Called by app.py.
"""
from flask import jsonify, request, current_app
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError

from db_config import engine
from log_config import logger

def get_stats():
    """
    Returns various preselected stats about db articles. 
    Called by app.get_stats_route().
    """
    try:
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 404

        # denotes whether or not the the query should be done on filtered articles.
        filtered = request.args.get('filtered', 'false').lower() == 'true'
        last_search_ids = current_app.last_search_ids if hasattr(current_app, 'last_search_ids') else None

        # base query to be built upon
        base_query = "FROM articles"

        # if filtered and searched, use searched ids
        if filtered and last_search_ids:
            base_query += f" WHERE id IN ({','.join(map(str, last_search_ids))})"

        # Queries URLs of the form www.url.com
        domain_query = text(f"""
            SELECT 
                SUBSTRING( REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/")- 1) as domain,
                COUNT(*) as count
            {base_query}
            GROUP BY domain
        """)

        # Queries URLs of the form www.url.com/subdirectory/
        subdir_query = text(f"""
            SELECT
                SUBSTRING(
                    REPLACE( REPLACE( URL, 'https://', ''), 'http://', '') ,
                    1,  
                    LENGTH(SUBSTRING( REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/")- 1))  
                    + INSTR(SUBSTRING(REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), INSTR(REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), '/') + 1), '/') +1
                ) as domain,
                COUNT (*) as count
            {base_query}
            GROUP BY domain
        """)

        # Queries dates and counts for articles
        dates_query = text(f"""
            SELECT time, COUNT(*) as count
            {base_query}
            GROUP BY strftime('%d-%m-%Y', time)
            ORDER BY time ASC
        """)

        with engine.connect() as connection:
            domain_rows = connection.execute(domain_query).fetchall()
            subdir_rows = connection.execute(subdir_query).fetchall()
            dates_row = connection.execute(dates_query).fetchall()

        dates = [{"name": time, "count": count} for time, count in dates_row]
        domain_data = [{"name": domain, "count": count} for domain, count in domain_rows]
        subdir_data = [{"name": domain, "count": count} for domain, count in subdir_rows]

        return jsonify(domain_data, subdir_data, dates), 200
    except SQLAlchemyError as e:
        logger.error("Database error when getting statistics: %s", e)
        return jsonify({"status": "error", "message": f"Database error when getting statistics: {str(e)}"}), 500
    except Exception as e:
        logger.error("Error when getting statistics: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
