from os.path import exists
import os
import threading
import subprocess
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS


from sqlalchemy import create_engine, MetaData, text

os.makedirs("./rss-fetcher/data/", exist_ok=True)
engine = create_engine(f'sqlite:///./rss-fetcher/data/data.db', echo=False)
meta = MetaData()
connection = engine.connect()

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

SCHEDULER_RUNNING = False
SCHEDULER_THREAD = None

def run_collect_and_process_script():
    global SCHEDULER_THREAD, SCHEDULER_RUNNING

    while SCHEDULER_RUNNING:
        try:
            subprocess.run(['python', 'collect.py'], cwd='./rss-fetcher', check=True)
            subprocess.run(['python', 'process.py'], cwd='./rss-fetcher', check=True)
        except subprocess.CalledProcessError as e:
            print("Error: ", e.stderr)

        # Wait for 5 min before rerun
        # ---- unfinished/not tested ----
        # scheduler_thread_timer = threading.Timer(300.0, run_collect_and_process_script())
        # scheduler_thread_timer.start()

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
        if exists('./rss-fetcher/data/feeds.txt'):
            with open('./rss-fetcher/data/feeds.txt') as f:
                feeds = f.readlines()
    except FileNotFoundError as e:
        print(f"Error in parsing rss-feeds from feeds.txt: {e.strerror}")
    return jsonify(feeds), 200

@app.route('/api/set_feed_urls', methods=['POST'])
def set_feed_urls():
    feeds = request.json
    feed_urls = feeds['feedUrls']
    with open('./rss-fetcher/data/feeds.txt', 'w') as f:
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
    stop_fetching()

    try:
        subprocess.run(['python', 'process.py'], check=True, cwd='./rss-fetcher')
        subprocess.run(['python', 'db_to_json.py'], check=True)
        return send_from_directory('./rss-fetcher/data', "articles.json", as_attachment=True)
    except subprocess.CalledProcessError as e:
        print("Running process and export resulted in failure")
        print("Error: ", e.stderr)
        return jsonify({"status": f"{e}"}), 400

@app.route('/api/articles/search', methods=['GET'])
def search_articles():
    try:
        search_query = request.args.get('searchQuery', '')
        stmt = text("SELECT STRFTIME('%d/%m/%Y, %H:%M', time), url FROM articles WHERE full_text LIKE :word")
        stmt = stmt.bindparams(word=f'%{search_query}%')
        result = connection.execute(stmt)
        rows = result.fetchall()
        data = [{"time": time, "url": url} for time, url in rows]
        return jsonify(data), 200
    except Exception as e:
        print("Error: ", e)
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)