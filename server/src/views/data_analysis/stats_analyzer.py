"""
This handles db articles statistics get route. Called by routes.py.
"""
import os
from flask import jsonify, request, current_app
from sqlalchemy import text, bindparam
from sqlalchemy.exc import SQLAlchemyError


from src.utils.resource_management import check_articles_table

def get_text():
    """
    Returns full_text field from db articles.
    Called by routes.init_routes() for route /api/articles/full_text.
    """

    try:
        db_check_error = check_articles_table()
        if db_check_error:
            return db_check_error

        # denotes whether or not the query should be done on filtered articles.
        filtered = request.args.get('filtered', 'false').lower() == 'true'
        last_search_ids = (
            current_app.last_search_ids
            if hasattr(current_app, 'last_search_ids')
            else None
        )

        whole_query = text(f"SELECT full_text FROM articles")

        if filtered and last_search_ids:
            where_clause = "WHERE id IN :ids"
            where_params = {'ids': tuple(last_search_ids)}
            whole_query = text(f"SELECT full_text FROM articles {where_clause}").bindparams(bindparam('ids', expanding=True))

        with current_app.db_engine.connect() as connection:
            text_query = connection.execute(whole_query, where_params).fetchall()

        text_data = [{"full_text": full_text[0]} for full_text in text_query]
        return jsonify(text_data), 200

    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when getting text fields")
        return jsonify({
            "status": "error",
            "message": f"Database error when getting text fields: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Error when getting text fields")
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

        # denotes whether or not the query should be done on filtered articles.
        filtered = request.args.get('filtered', 'false').lower() == 'true'
        last_search_ids = (
            current_app.last_search_ids
            if hasattr(current_app, 'last_search_ids')
            else None
        )

        # Queries URLs of the form www.url.com
        domain_query = text(f"""
                SELECT 
                    SUBSTRING(
                        REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), 
                        1, 
                        INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/") - 1
                    ) as domain,
                    COUNT(*) as count
                FROM articles
                GROUP BY domain
            """)

        # Queries URLs of the form www.url.com/subdirectory/
        subdir_query = text(f"""
                SELECT
                    SUBSTRING(
                        REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), 
                        1,  
                        LENGTH(SUBSTRING(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/") - 1))  
                        + INSTR(SUBSTRING(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), '/') + 1), '/') + 1
                    ) as domain,
                    COUNT(*) as count
                FROM articles
                GROUP BY domain
            """)

        # Queries dates for time series
        dates_query = text(f"""
                SELECT time, COUNT(*) as count
                FROM articles
                WHERE time IS NOT NULL AND time != ''
                GROUP BY strftime('%d-%m-%Y', time)
                ORDER BY time ASC
            """)

        # if filtered and searched, use searched ids
        if filtered and last_search_ids:
            where_clause = "WHERE id IN :ids"
            where_params = {'ids': tuple(last_search_ids)}

            domain_query = text(f"""
                                SELECT 
                                    SUBSTRING(
                                        REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), 
                                        1, 
                                        INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/") - 1
                                    ) as domain,
                                    COUNT(*) as count
                                FROM articles
                                {where_clause}
                                GROUP BY domain
                            """).bindparams(bindparam('ids', expanding=True))

            subdir_query = text(f"""
                                SELECT
                                    SUBSTRING(
                                        REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), 
                                        1,  
                                        LENGTH(SUBSTRING(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/") - 1))  
                                        + INSTR(SUBSTRING(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), '/') + 1), '/') + 1
                                    ) as domain,
                                    COUNT(*) as count
                                FROM articles
                                {where_clause}
                                GROUP BY domain
                            """).bindparams(bindparam('ids', expanding=True))

            dates_query = text(f"""
                                SELECT time, COUNT(*) as count
                                FROM articles
                                WHERE time IS NOT NULL AND time != ''
                                {"AND " + where_clause[6:] if where_clause else ""}
                                GROUP BY strftime('%d-%m-%Y', time)
                                ORDER BY time ASC
                            """).bindparams(bindparam('ids', expanding=True))

        with current_app.db_engine.connect() as connection:
            domain_rows = connection.execute(domain_query, where_params).fetchall()
            subdir_rows = connection.execute(subdir_query, where_params).fetchall()
            dates_row = connection.execute(dates_query, where_params).fetchall()

        return jsonify(
            [{"name": domain, "count": count} for domain, count in domain_rows],
            [{"name": domain, "count": count} for domain, count in subdir_rows],
            [{"name": time, "count": count} for time, count in dates_row]
        ), 200

    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when getting statistics")
        return jsonify({
            "status": "error",
            "message": f"Database error when getting statistics: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Error when getting statistics")
        return jsonify({"status": "error", "message": str(e)}), 500


def get_data_size():
    """
    Returns the size of the data.db file.
    Called by routes.init_routes() for route /api/data_size.
    """
    try:
        db_path = os.path.join(current_app.config['FETCHER_FOLDER'], 'data', 'data.db')

        if not os.path.exists(db_path):
            return jsonify({"size": "0 bytes"}), 200

        size_bytes = os.path.getsize(db_path)

        if size_bytes < 1024:
            size_str = f"{size_bytes} bytes"
        elif size_bytes < 1024 * 1024:
            size_str = f"{size_bytes / 1024:.2f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            size_str = f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            size_str = f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

        return jsonify({"size": size_str}), 200

    except Exception as e:
        current_app.logger.exception("Error when getting data size")
        return jsonify({"status": "error", "message": str(e)}), 500
