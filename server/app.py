"""
This is the main backend app for the project.
"""
import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine

from scheduler_config import init_scheduler, Config
from config import DATABASE_URL, FETCHER_FOLDER
from log_config import LOG_FILE_PATH

from data_acquisition.feed_manager import get_feed_urls, set_feed_urls
from data_acquisition.content_fetcher import start_fetch, stop_fetch, get_fetch_status
from data_analysis.query_processor import get_search_results
from data_analysis.stats_analyzer import get_stats
from data_export.export_manager import get_export

os.makedirs(f"./{FETCHER_FOLDER}/data/", exist_ok=True)
engine = create_engine(DATABASE_URL, echo=False)
connection = engine.connect()

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})
app.config.from_object(Config())

init_scheduler(app)

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    Default view.
    """
    if path != "" and path != "api" and os.path.exists("static/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/get_feed_urls', methods=['GET'])
def get_feed_urls_route():
    """
    Returns saved feeds from feeds.txt. Uses feed_manager.py.
    """
    return get_feed_urls()

@app.route('/api/set_feed_urls', methods=['POST'])
def set_feed_urls_route():
    """
    Saves added feeds to feeds.txt. Uses feed_manager.py.
    """
    return set_feed_urls()

@app.route('/api/start', methods=['POST'])
def start_fetch_route():
    """
    Schedules and starts the fetching job. Uses content_fetcher.py.
    Runs collect.py and process.py on the submitted feeds.
    """
    return start_fetch()

@app.route('/api/stop', methods=['POST'])
def stop_fetch_route():
    """
    Stops the fetching job. Uses content_fetcher.py.
    """
    return stop_fetch()

@app.route('/api/status', methods=['GET'])
def get_fetch_status_route():
    """
    Checks status of the fetching job. Uses content_fetcher.py.
    """
    return get_fetch_status()

@app.route('/api/articles/search', methods=['GET'])
def get_search_results_route():
    """
    Search db for a query and return results. Uses query_processor.py.
    """
    return get_search_results(engine)

@app.route('/api/articles/statistics', methods=['GET'])
def get_stats_route():
    """
    Returns stats about db articles. Uses stats_analyzer.py.
    """
    return get_stats(engine)

@app.route('/api/articles/export', methods=['GET'])
def get_export_route():
    """
    Exports the articles from db. Uses export_manager.py.
    """
    return get_export(engine)

@app.route('/api/error_logs', methods=['GET'])
def get_error_log_route():
    """
    Returns a log report of errors. Uses log_config.py.
    """
    try:
        with open(LOG_FILE_PATH, 'r', encoding='utf-8') as log_file:
            log_records = log_file.read()
        return jsonify(logs=log_records.splitlines()), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch logs", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
