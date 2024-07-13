"""
This handles exporting files from db. Called by app.py.
"""
import time
from flask import jsonify, send_from_directory, request, current_app
from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError
import pandas as pd

from db_config import engine, ProcessingStatus
from log_config import logger
from config import FETCHER_FOLDER
from data_export.format_converter import convert_db_to_format

def get_all_export():
    """
    Returns an export file of all of db articles via export_articles().
    Called by app.get_all_export_route().
    """
    if len(request.args.getlist('format')) > 1:
        return jsonify({"status": "error", "message": "Invalid format requested."}), 400

    file_format = request.args.get('format')
    error = validate_format(file_format)
    if error:
        return error

    # wait for processing to finish
    while ProcessingStatus.get_status():
        time.sleep(1)

    query = "SELECT * FROM articles"
    return export_articles(query, file_format)

def get_query_export():
    """
    Returns an export file of queried db articles via export_articles().
    Called by app.get_query_export_route().
    """
    file_format = request.args.get('format')
    error = validate_format(file_format)
    if error:
        return error
    
    # wait for processing to finish if it were to coincide
    while ProcessingStatus.get_status():
        time.sleep(1)

    last_search_ids = current_app.last_search_ids if hasattr(current_app, 'last_search_ids') else None

    if last_search_ids:
        query = f"SELECT * FROM articles WHERE id IN ({','.join(map(str, last_search_ids))})"
    else:
        query = "SELECT * FROM articles"

    return export_articles(query, file_format, "articles_query")

def export_articles(query, file_format, base_filename="articles"):
    """
    Queries database for either all or a specified query to export.
    Passes it to convert_and_send().
    Called by get_all_export() and get_query_export().
    """
    try:
        error = check_articles_table()
        if error:
            return error

        df = pd.read_sql_query(query, engine)
        return convert_and_send(df, file_format, base_filename)
    except SQLAlchemyError as e:
        logger.error("Database error when downloading: %s", e)
        return jsonify({"status": "error", "message": f"Database error when downloading: {str(e)}"}), 500
    except Exception as e:
        logger.error("Downloading articles resulted in failure: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 400

def convert_and_send(df, file_format, base_filename):
    """
    Converts the dataframe to the specified format via
    format_converter.convert_db_to_format(). Called by export_articles().
    Lastly sends the converted file on via Flask.
    """
    try:
        output_file_path = convert_db_to_format(df, file_format, base_filename)
        return send_from_directory(f'./{FETCHER_FOLDER}/data', output_file_path, as_attachment=True)
    except Exception as e:
        logger.error("Exporting articles resulted in failure: %s", e)
        return jsonify({"status": "error", "message": f"Exporting articles resulted in failure: {str(e)}"}), 400

# the following functions just help to validate

def check_articles_table():
    """
    Checks whether the table exists, used often. Used by export_articles().
    """
    inspector = inspect(engine)
    if not inspector.has_table('articles'):
        return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 404
    return None

def validate_format(file_format):
    """
    Checks for format errors that are unlikely to occur as the format's not typed.
    Used by get_all_export() and get_query_export().
    """
    if not file_format:
        return jsonify({"status": "error", "message": "No format specified."}), 400
    if file_format not in ['json', 'csv', 'parquet']:
        return jsonify({"status": "error", "message": "Invalid format requested."}), 400
    return None
