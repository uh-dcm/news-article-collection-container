from os.path import exists
import os
from flask import Flask, jsonify, send_from_directory, request
import json
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import subprocess
from datetime import datetime

from sqlalchemy import create_engine, MetaData, text

os.makedirs("./rss-fetcher/data/", exist_ok=True)
engine = create_engine(f'sqlite:///./rss-fetcher/data/data.db', echo=False)
meta = MetaData()
connection = engine.connect()

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

scheduler = BackgroundScheduler()

def run_collect_and_process_script():
    subprocess.run(["python", "collect.py"], cwd='./rss-fetcher') # setting script to happen in rss-fetcher folder
    subprocess.run(["python", "process.py"], cwd='./rss-fetcher') # setting script to happen in rss-fetcher folder


@app.route('/api/start', methods=['POST'])
def start_fetching():
    if not scheduler.get_jobs():
        scheduler.add_job(run_collect_and_process_script, 'interval', minutes=5, id='fetcher-collect', next_run_time=datetime.now())
        scheduler.start()
        return jsonify({"status": "started"}), 200
    return jsonify({"status": "already running"}), 200

@app.route('/api/stop', methods=['POST'])
def stop_fetching():
    if scheduler.get_jobs():
        scheduler.remove_job('fetcher-collect')
        return jsonify({"status": "stopped"}), 200
    return jsonify({"status": "it was not running"}), 200

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
    cwd = os.path.dirname(os.path.abspath(__file__))
    try:
        subprocess.run(['python', 'process.py'], check=True, cwd='./rss-fetcher')
        subprocess.run(['python', 'db_to_json.py'], check=True)
        return send_from_directory('./rss-fetcher/data', "articles.json", as_attachment=True)
    except subprocess.CalledProcessError as e:
        print("Running process and export resulted in failure")
        print("Error: ", e.stderr)

@app.route('/api/articles/search', methods=['GET'])
def search_articles():
    try:
        search_query = request.args.get('searchQuery', '')
        stmt = text("SELECT time, url FROM articles WHERE full_text LIKE :word")
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