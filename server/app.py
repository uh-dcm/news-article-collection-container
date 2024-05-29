from os.path import exists
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import subprocess
from datetime import datetime

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

scheduler = BackgroundScheduler()

def run_collect_script():
    subprocess.run(["python", "collect.py"], cwd='./rss-fetcher') # setting script to happen in rss-fetcher folder

def run_process_script():
    subprocess.run(["python", "process.py"], cwd='./rss-fetcher') # setting script to happen in rss-fetcher folder

@app.route('/api/start', methods=['POST'])
def start_fetching():
    if not scheduler.get_jobs():
        scheduler.add_job(run_collect_script, 'interval', minutes=5, id='fetcher-collect', next_run_time=datetime.now())
        scheduler.add_job(run_process_script, 'interval', minutes=30, id='fetcher-process')
        scheduler.start()
        return jsonify({"status": "started"}), 200
    return jsonify({"status": "already running"}), 200

@app.route('/api/stop', methods=['POST'])
def stop_fetching():
    if scheduler.get_jobs():
        scheduler.remove_job('fetcher-collect')
        scheduler.remove_job('fetcher-process')
        return jsonify({"status": "stopped"}), 200
    return jsonify({"status": "it was not running"}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and path != "api" and exists("static/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    print("yellow")
    app.run(host='0.0.0.0', port=5000)