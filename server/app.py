"""
This is the main backend app for the project.
"""
from os.path import exists
import os
import subprocess
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_apscheduler import APScheduler
from sqlalchemy import create_engine, MetaData, inspect, text
from config import DATABASE_URL, FETCHER_FOLDER
from log_config import logger, LOG_FILE_PATH
from services.download import download_articles
from services.search import search_articles, get_stats

class Config:
    SCHEDULER_API_ENABLED = True

os.makedirs(f"./{FETCHER_FOLDER}/data/", exist_ok=True)
engine = create_engine(DATABASE_URL, echo=False)
meta = MetaData()
connection = engine.connect()

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})
app.config.from_object(Config())

scheduler = APScheduler()
scheduler.init_app(app)

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

# this is triggered by start_fetching
# runs collect.py and process.py on the submitted feeds
# hogs database for itself with the lock
def run_collect_and_process():
    if os.path.exists(LOCK_FILE):
        print("Processing is already active.")
        return

    try:
        with open(LOCK_FILE, 'w') as f:
            f.write('processing')

        result = subprocess.run(['python3', 'collect.py'], cwd=f'./{FETCHER_FOLDER}', capture_output=True, check=True, text=True)
        if result.stdout:
            logger.info(result.stdout.strip())
        result = subprocess.run(['python3', 'process.py'], cwd=f'./{FETCHER_FOLDER}', capture_output=True, check=True, text=True)
        if result.stdout:
            logger.info(result.stdout.strip())

    except subprocess.CalledProcessError as e:
        print("Error: ", e.stderr)
    finally:
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)

@app.route('/api/start', methods=['POST'])
def start_fetching():
    if not scheduler.get_job('collect_and_process'):
        scheduler.add_job(
            id='collect_and_process',
            func=run_collect_and_process,
            trigger='interval',
            minutes=5,
            misfire_grace_time=300
        )
        run_collect_and_process()
        return jsonify({"status": "started"}), 201
    else:
        return jsonify({"status": "already running"}), 409

@app.route('/api/stop', methods=['POST'])
def stop_fetching():
    if scheduler.get_job('collect_and_process'):
        scheduler.remove_job('collect_and_process')
        return jsonify({"status": "stopped"}), 200
    else:
        return jsonify({"status": "it was not running"}), 409

@app.route('/api/status', methods=['GET'])
def fetching_status():
    if scheduler.get_job('collect_and_process'):
        return jsonify({"status": "running"}), 200
    else:
        return jsonify({"status": "stopped"}), 400

@app.route('/api/get_feed_urls', methods=['GET'])
def get_feed_urls():
    feeds = []
    try:
        if exists(f'./{FETCHER_FOLDER}/data/feeds.txt'):
            with open(f'./{FETCHER_FOLDER}/data/feeds.txt') as f:
                feeds = f.readlines()
    except FileNotFoundError as e:
        print(f"Error in parsing rss-feeds from feeds.txt: {e.strerror}")
    return jsonify(feeds), 200

@app.route('/api/set_feed_urls', methods=['POST'])
def set_feed_urls():
    feeds = request.json
    feed_urls = feeds['feedUrls']
    with open(f'./{FETCHER_FOLDER}/data/feeds.txt', 'w') as f:
        f.write("\n".join(feed_urls))
    return jsonify({"status": "success"}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and path != "api" and exists("static/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# downloads the articles from db, uses download.py
@app.route('/api/articles', methods=['GET'])
def download():
    return download_articles(engine)

# search db for a query and return results, uses search.py
@app.route('/api/articles/search', methods=['GET'])
def search():
    return search_articles(engine)

@app.route('/api/articles/statistics', methods=['GET'])
def aggregate_by_domain():
    return get_stats(engine)

@app.route('/api/error_logs', methods=['GET'])
def get_error_log():
    try:
        with open(LOG_FILE_PATH, 'r') as log_file:
            log_records = log_file.read()
        return jsonify(logs=log_records.splitlines()), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch logs", "details": str(e)}), 500

if __name__ == '__main__':
    scheduler.start()
    app.run(host='0.0.0.0', port=5000)
