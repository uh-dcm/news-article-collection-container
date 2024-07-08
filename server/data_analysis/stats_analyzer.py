"""
This returns statistics about db articles. Called by app.py.
"""
from flask import jsonify
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError

from log_config import logger

def get_stats(engine):
    """
    Returns various preselected stats about db articles.
    Called by app.get_stats_route().
    """
    try:
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 404

        # Queries URLs of the form www.url.com
        domain_query = text("""
                            SELECT 
                                SUBSTRING( REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/")- 1) as domain,
                                COUNT(*) as count
                            FROM articles 
                            GROUP BY domain
                            """)
        result = engine.connect().execute(domain_query)
        domain_rows = result.fetchall()

        # Queries URLs of the form www.url.com/subdirectory/
        subdir_query = text("""
                            SELECT
                                SUBSTRING(
                                    REPLACE( REPLACE( URL, 'https://', ''), 'http://', '') ,
                                    1,  
                                    LENGTH(SUBSTRING( REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/")- 1))  
                                    + INSTR(SUBSTRING(REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), INSTR(REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), '/') + 1), '/') +1
                                    ) as domain,
                            COUNT (*) as count
                            FROM articles
                            GROUP BY domain
                                """)
        result = engine.connect().execute(subdir_query)
        subdir_rows = result.fetchall()

        # Queries dates and counts for articles
        dates_query = text("""
                            SELECT time, COUNT(*) as count
                            FROM articles
                            GROUP BY strftime('%d-%m-%Y', time)
                            ORDER BY time ASC;
                            """)
        result = engine.connect().execute(dates_query)
        dates_row = result.fetchall()

        dates = [{"name": time, "count": count} for time, count in dates_row]
        domain_data = [{"name": domain, "count": count} for domain, count in domain_rows]
        subdir_data = [{"name": domain, "count": count} for domain, count in subdir_rows]
        return jsonify(domain_data, subdir_data, dates), 200
    except SQLAlchemyError as e:
        logger.error("Database error when qetting statistics: %s", e)
        return jsonify({"status": "error", "message": f"Database error when getting statistics: {str(e)}"}), 500
    except Exception as e:
        logger.error("Error when getting statistics: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
