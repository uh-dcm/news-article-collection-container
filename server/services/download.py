"""
This handles downloads from db, called by app.py.
"""
import os
import time
import subprocess
from flask import jsonify, send_from_directory, request
from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError
from config import FETCHER_FOLDER
from log_config import logger
from services.transformer import transform_db_to_format

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def transform_articles(engine, format):
    output_file_path = None
    try:
        transform_db_to_format(engine, format)
        if format == 'json':
            output_file_path = "articles.json"
        elif format == 'csv':
            output_file_path = "articles.csv"
        elif format == 'parquet':
            output_file_path = "articles.parquet"
        else:
            return jsonify({"status": "error", "message": "Invalid format requested."}), 400

        return send_from_directory(f'./{FETCHER_FOLDER}/data', output_file_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Transforming articles resulted in failure: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400

def download_articles(engine):
    # handle possibility of multiple formats being requested at once
    if len(request.args.getlist('format')) > 1:
        return jsonify({"status": "error", "message": "Invalid format requested."}), 400

    # '/api/articles' defaults to json for backwards compatibility for now
    format = request.args.get('format', 'json')

    # wait for collect.py and process.py to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    try:
        # check whether the table exists, this is used often
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 400

        # this format check is just extra security, likely never used
        if format not in ['json', 'csv', 'parquet']:
            return jsonify({"status": "error", "message": "Invalid format requested."}), 400

        return transform_articles(engine, format)
    except SQLAlchemyError as e:
        logger.error(f"Database error when downloading: {e}")
        return jsonify({"status": "error", "message": f"Database error when downloading: {str(e)}"}), 500
    except subprocess.CalledProcessError as e:
        logger.error(f"Subprocess error when downloading: {e}")
        return jsonify({"status": "error", "message": "Error during subprocess execution."}), 400
    except Exception as e:
        logger.error(f"Downloading articles resulted in failure: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400
