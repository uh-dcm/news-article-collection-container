"""
This handles exporting files from db. Called by app.py.
"""
import os
import time
import pandas as pd
from flask import jsonify, send_from_directory, request, current_app
from sqlalchemy.exc import SQLAlchemyError

from src.utils.resource_management import check_articles_table
from src.utils.processing_status import ProcessingStatus
from src.views.data_export.format_converter import convert_db_to_format

def get_all_export():
    """
    Returns an export file of all of db articles via export_articles().
    Called by app.get_all_export_route().
    """
    # wait for processing to finish
    while ProcessingStatus.get_status():
        time.sleep(1)

    query = "SELECT * FROM articles"
    return export_articles(query, request.args.get('format'))

def get_query_export():
    """
    Returns an export file of queried db articles via export_articles().
    Called by app.get_query_export_route().
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
        query = f"SELECT * FROM articles WHERE id IN ({','.join(map(str, last_search_ids))})"
    else:
        query = "SELECT * FROM articles"

    return export_articles(query, request.args.get('format'), "articles_query")

def export_articles(query, file_format, base_filename="articles"):
    """
    Queries database for either all or a specified query to export.
    Passes it to convert_and_send().
    Called by get_all_export() and get_query_export().
    """
    try:
        db_check_error = check_articles_table()
        if db_check_error:
            return db_check_error

        df = pd.read_sql_query(query, current_app.db_engine)
        return convert_and_send(df, file_format, base_filename)
    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when downloading")
        return jsonify({
            "status": "error",
            "message": f"Database error when downloading: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Downloading articles resulted in failure")
        return jsonify({"status": "error", "message": str(e)}), 400

def convert_and_send(df, file_format, base_filename):
    """
    Converts the dataframe to the specified format via
    format_converter.convert_db_to_format(). Called by export_articles().
    Lastly sends the converted file on via Flask.
    """
    try:
        output_file_path = convert_db_to_format(df, file_format, base_filename)
        directory = os.path.abspath(os.path.join(current_app.config["FETCHER_FOLDER"], "data"))
        return send_from_directory(directory, output_file_path, as_attachment=True)
    except Exception as e:
        current_app.logger.exception("Exporting articles resulted in failure")
        return jsonify({
            "status": "error",
            "message": f"Exporting articles resulted in failure: {str(e)}"
        }), 400
