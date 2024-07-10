"""
This handles exporting files from db. Called by app.py.
"""
import os
import time
from flask import jsonify, send_from_directory, request
from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError

from log_config import logger
from config import FETCHER_FOLDER
from data_export.format_converter import convert_db_to_format

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def get_export(engine):
    """
    Returns an export file of db via convert(). Called by app.get_export_route().
    """
    # this multiple format request check is just extra security, likely never used
    if len(request.args.getlist('format')) > 1:
        return jsonify({"status": "error", "message": "Invalid format requested."}), 400

    file_format = request.args.get('format')

    # these format type check are just extra security, likely never used
    if not file_format:
        return jsonify({"status": "error", "message": "No format specified."}), 400
    if file_format not in ['json', 'csv', 'parquet']:
        return jsonify({"status": "error", "message": "Invalid format requested."}), 400

    # wait for processing to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    try:
        # check whether the table exists, this is used often
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 404

        return convert(engine,file_format) # the main part
    except SQLAlchemyError as e:
        logger.error("Database error when downloading: %s", e)
        return jsonify({"status": "error", "message": f"Database error when downloading: {str(e)}"}), 500
    except Exception as e:
        logger.error("Downloading articles resulted in failure: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 400

def convert(engine, file_format):
    """
    Manages converting via format_converter.convert_db_to_format(). Called by get_export().
    """
    output_file_path = None
    try:
        convert_db_to_format(engine, file_format)
        if file_format == 'json':
            output_file_path = "articles.json"
        elif file_format == 'csv':
            output_file_path = "articles.csv"
        elif file_format == 'parquet':
            output_file_path = "articles.parquet"
        else:
            return jsonify({"status": "error", "message": "Invalid format requested."}), 400

        return send_from_directory(f'./{FETCHER_FOLDER}/data', output_file_path, as_attachment=True)
    except Exception as e:
        logger.error("Exporting articles resulted in failure: %s", e)
        return jsonify({"status": "error", "message": f"Exporting articles resulted in failure: {str(e)}"}), 400
