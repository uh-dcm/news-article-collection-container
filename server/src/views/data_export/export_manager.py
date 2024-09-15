"""
This handles db file export routes. Called by routes.py.
"""
import os
import time
from flask import jsonify, request, current_app, stream_with_context
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

from src.utils.resource_management import check_articles_table
from src.utils.processing_status import ProcessingStatus
from src.views.data_export.format_converter import (
    convert_db_to_json,
    convert_db_to_csv,
    convert_db_to_parquet
)

def get_all_export():
    """
    Returns an export file of all of db articles via export_articles().
    Called by routes.init_routes() for route /api/articles/export.
    """
    # wait for processing to finish
    while ProcessingStatus.get_status():
        time.sleep(1)

    query = text("SELECT * FROM articles")
    return export_articles(query, request.args.get('format'))

def get_query_export():
    """
    Returns an export file of queried db articles via export_articles().
    Called by routes.init_routes() for route /api/articles/export_query.
    """
    # wait for processing to finish if it were to coincide
    while ProcessingStatus.get_status():
        time.sleep(1)

    # check searched ids
    last_search_ids = (
        current_app.last_search_ids
        if hasattr(current_app, 'last_search_ids')
        else None
    )

    if last_search_ids:
        query = text(f"SELECT * FROM articles WHERE id IN ({','.join(map(str, last_search_ids))})")
    else:
        query = text("SELECT * FROM articles")

    return export_articles(query, request.args.get('format'), "articles_query")

def export_articles(query, file_format, base_filename="articles"):
    """
    Prepares export by checking database and readying the export file.
    Passes the query, the readied file path and a db conn to convert_and_send().
    Called by get_all_export() and get_query_export().
    """
    try:
        db_check_error = check_articles_table()
        if db_check_error:
            return db_check_error

        fetcher_folder = current_app.config["FETCHER_FOLDER"]
        output_file_path = os.path.join(
            fetcher_folder,
            "data",
            f"{base_filename}.{file_format}"
        )

        with current_app.db_engine.connect() as conn:
            return convert_and_send(conn, query, file_format, output_file_path)
    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when downloading")
        return jsonify({
            "status": "error",
            "message": f"Database error when downloading: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Downloading articles resulted in failure")
        return jsonify({"status": "error", "message": str(e)}), 400

def convert_and_send(conn, query, file_format, output_file_path):
    """
    Converts the db data to the specified format via format_converter.py.
    Called by export_articles(). Separates JSON and CSV downloads from Parquet,
    which needs to be built whole locally before being sent over, but this also
    enables sending knowledge of the total Parquet file size, which allows percentage
    to be shown on the client side. Also note that because we're dealing with SQLite,
    it appears that the query execution doesn't need "stream_results=True" as SQLite
    only gets what it needs from the file at the specific time of use. However memory
    garbage collection might not be working optimally with these Flask downloads,
    as the memory usage appears to remain the same until the next download?
    """
    try:
        result = conn.execute(query)

        content_type = {
            'json': 'application/json',
            'csv': 'text/csv',
            'parquet': 'application/octet-stream',
        }.get(file_format, 'application/octet-stream')

        if file_format in ['json', 'csv']:
            # json and csv can just send chunks over as they are converted
            convert_func = convert_db_to_json if file_format == 'json' else convert_db_to_csv

            def generate():
                yield from convert_func(result)
        elif file_format == 'parquet':
            # parquet needs to build the file locally first before streaming
            # if it runs out of space it still removes the file
            try:
                convert_db_to_parquet(result, output_file_path)
            except Exception as e:
                if os.path.exists(output_file_path):
                    os.remove(output_file_path)
                raise e

            file_size = os.path.getsize(output_file_path)

            def generate():
                with open(output_file_path, 'rb') as file:
                    while True:
                        chunk = file.read(8192)
                        if not chunk:
                            break
                        yield chunk
                os.remove(output_file_path)
        else:
            return jsonify({"status": "error", "message": "Unsupported format"}), 400

        response = current_app.response_class(
            stream_with_context(generate()),
            content_type=content_type
        )
        response.headers.set(
            'Content-Disposition', f'attachment; filename="{os.path.basename(output_file_path)}"'
        )
        if file_format == 'parquet':
            response.headers.set('Content-Length', file_size)
        return response

    except Exception as e:
        current_app.logger.exception("Exporting articles resulted in failure")
        return jsonify({
            "status": "error",
            "message": f"Exporting articles resulted in failure: {str(e)}"
        }), 400
