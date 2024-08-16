"""
This handles db articles statistics get route. Called by routes.py.
"""
from flask import jsonify, request, current_app
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.utils.resource_management import check_articles_table

# TODO: Remove SQL injection vulnerability from queries (no string interpolation)

def get_text():
    """
    Returns full_text field from db articles.
    Called by routes.init_routes() for route /api/articles/full_text.
    """

    try:
        db_check_error = check_articles_table()
        if db_check_error:
            return db_check_error

        # denotes whether or not the the query should be done on filtered articles.
        filtered = request.args.get('filtered', 'false').lower() == 'true'
        last_search_ids = (
            current_app.last_search_ids
            if hasattr(current_app, 'last_search_ids')
            else None
        )
        # base query to be built upon
        base_query = "FROM articles"

        text_query = text(f"SELECT full_articles FROM {base_query}")

        # if filtered and searched, use searched ids
        if filtered and last_search_ids:
            base_query += f" WHERE id IN ({','.join(map(str, last_search_ids))})"

        with current_app.db_engine.connect() as connection:
            text_query = connection.execute(text_query).fetchall()

        text_data = [{"full_text": full_text for full_text in text_query}]
        return jsonify(text_data), 200

    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when getting statisticss")
        return jsonify({
            "status": "error",
            "message": f"Database error when getting statistics: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Error when getting statistics")
        return jsonify({"status": "error", "message": str(e)}), 500


def get_stats():
    """
    Returns various preselected stats about db articles.
    Called by routes.init_routes() for route /api/articles/statistics.
    """
    try:
        db_check_error = check_articles_table()
        if db_check_error:
            return db_check_error

        # denotes whether or not the the query should be done on filtered articles.
        filtered = request.args.get('filtered', 'false').lower() == 'true'
        last_search_ids = (
            current_app.last_search_ids
            if hasattr(current_app, 'last_search_ids')
            else None
        )
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

        with current_app.db_engine.connect() as connection:
            domain_rows = connection.execute(domain_query).fetchall()
            subdir_rows = connection.execute(subdir_query).fetchall()
            dates_row = connection.execute(dates_query).fetchall()

        dates = [{"name": time, "count": count} for time, count in dates_row]
        domain_data = [{"name": domain, "count": count} for domain, count in domain_rows]
        subdir_data = [{"name": domain, "count": count} for domain, count in subdir_rows]

        return jsonify(domain_data, subdir_data, dates), 200

    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when getting statisticss")
        return jsonify({
            "status": "error",
            "message": f"Database error when getting statistics: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Error when getting statistics")
        return jsonify({"status": "error", "message": str(e)}), 500
