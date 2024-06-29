"""
This handles downloads from db, called by app.py.
"""
import os
import time
from flask import jsonify, send_from_directory, request
from sqlalchemy import inspect
from config import FETCHER_FOLDER
from log_config import logger
from downloader.db_to_json import transform_articles_to_json
from downloader.db_to_csv import transform_articles_to_csv
from downloader.db_to_parquet import transform_articles_to_parquet

LOCK_FILE = f'./{FETCHER_FOLDER}/processing.lock'

def transform_articles(format):
    if format == 'json':
        transform_articles_to_json()
        return send_from_directory(f'./{FETCHER_FOLDER}/data', "articles.json", as_attachment=True)
    elif format == 'csv':
        transform_articles_to_csv()
        return send_from_directory(f'./{FETCHER_FOLDER}/data', "articles.csv", as_attachment=True)
    elif format == 'parquet':
        transform_articles_to_parquet()
        return send_from_directory(f'./{FETCHER_FOLDER}/data', "articles.parquet", as_attachment=True)
    else:
        return jsonify({"status": "error", "message": "Invalid format requested."}), 400

def download_articles(engine):
    format = request.args.get('format', 'json')

    # wait for collect.py and process.py to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    # check whether the table exists
    inspector = inspect(engine)
    if not inspector.has_table('articles'):
        return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 400

    try:
        return transform_articles(format)
    except Exception as e:
        logger.error(f"Running process and export resulted in failure: {e}")
        return jsonify({"status": f"{e}"}), 400
