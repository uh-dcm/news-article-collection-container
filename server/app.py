"""
This is the main backend app for the project.
"""
from os.path import exists
import os
import threading
import subprocess
import time
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from sqlalchemy import create_engine, MetaData, text, inspect
from config import DATABASE_URL, FETCHER_FOLDER

os.makedirs(f"./{FETCHER_FOLDER}/data/", exist_ok=True)
engine = create_engine(DATABASE_URL, echo=False)
meta = MetaData()
connection = engine.connect()

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

SCHEDULER_RUNNING = False
SCHEDULER_THREAD = None
PROCESSING_ACTIVE = False
STOP_EVENT = threading.Event()

def run_collect_and_process_script():
    global SCHEDULER_THREAD, SCHEDULER_RUNNING, PROCESSING_ACTIVE

    while SCHEDULER_RUNNING:
        try:
            PROCESSING_ACTIVE = True
            subprocess.run(['python', 'collect.py'], cwd=f'./{FETCHER_FOLDER}', check=True)
            subprocess.run(['python', 'process.py'], cwd=f'./{FETCHER_FOLDER}', check=True)
            PROCESSING_ACTIVE = False
        except subprocess.CalledProcessError as e:
            print("Error: ", e.stderr)
            PROCESSING_ACTIVE = False
        
        # this process will repeat, and this is to make it 5 mins
        # the stop_event is to make the tests not wait
        STOP_EVENT.wait(300)

@app.route('/api/start', methods=['POST'])
def start_fetching():
    global SCHEDULER_THREAD, SCHEDULER_RUNNING

    if not SCHEDULER_RUNNING:
        SCHEDULER_RUNNING = True
        SCHEDULER_THREAD = threading.Thread(target=run_collect_and_process_script)
        SCHEDULER_THREAD.start()
        return jsonify({"status": "started"}), 201
    else:
        return jsonify({"status": "already running"}), 409

@app.route('/api/stop', methods=['POST'])
def stop_fetching():
    global SCHEDULER_THREAD, SCHEDULER_RUNNING

    if SCHEDULER_RUNNING:
        SCHEDULER_RUNNING = False
        SCHEDULER_THREAD = None
        return jsonify({"status": "stopped"}), 200
    else:
        return jsonify({"status": "it was not running"}), 409

@app.route('/api/status', methods=['GET'])
def fetching_status():
    global SCHEDULER_RUNNING

    if SCHEDULER_RUNNING:
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

@app.route('/api/articles', methods=['GET'])
def download_articles():
    global PROCESSING_ACTIVE

    while PROCESSING_ACTIVE:
        time.sleep(1)

    inspector = inspect(engine)
    if not inspector.has_table('articles'):
        return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 400

    try:
        subprocess.run(['python', 'db_to_json.py'], check=True)
        return send_from_directory(f'./{FETCHER_FOLDER}/data', "articles.json", as_attachment=True)
    except subprocess.CalledProcessError as e:
        print("Running process and export resulted in failure")
        print("Error: ", e.stderr)
        return jsonify({"status": f"{e}"}), 400

@app.route('/api/articles/search', methods=['GET'])
def search_articles():
    try:
        search_query = request.args.get('searchQuery', '')
        stmt = text("SELECT STRFTIME('%d/%m/%Y, %H:%M', time), url, full_text FROM articles WHERE full_text LIKE :word COLLATE utf8_general_ci")
        stmt = stmt.bindparams(word=f'%{search_query}%')
        result = connection.execute(stmt)
        rows = result.fetchall()
        data = [{"time": time, "url": url, "full_text": full_text} for time, url, full_text in rows]
        return jsonify(data), 200
    except Exception as e:
        print("Error: ", e)
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)