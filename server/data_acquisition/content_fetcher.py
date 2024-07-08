"""
This schedules fetching and manages collect.py and process.py. Called by app.py.
"""
import os
import subprocess
from flask import jsonify

from scheduler_config import scheduler
from log_config import logger
from config import FETCHER_FOLDER

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def start_fetch():
    """
    Schedules the fetching job to run at five minute intervals, starting now.
    Uses run_collect_and_process(). Called by app.start_fetch_route().
    """
    if not scheduler.get_job('collect_and_process'):
        scheduler.add_job(
            id='collect_and_process',
            func=run_collect_and_process,
            trigger='interval',
            minutes=5,
            misfire_grace_time=30
        )
        run_collect_and_process()
        return jsonify({"status": "started"}), 201
    else:
        return jsonify({"status": "already running"}), 409

def stop_fetch():
    """
    Asks scheduler if the job exists, and if it does, tells it to end it.
    Called by app.stop_fetch_route().
    """
    if scheduler.get_job('collect_and_process'):
        scheduler.remove_job('collect_and_process')
        return jsonify({"status": "stopped"}), 200
    else:
        return jsonify({"status": "it was not running"}), 409

def get_fetch_status():
    """
    Asks scheduler the status of the job. Called by app.fetch_status_route().
    """
    if scheduler.get_job('collect_and_process'):
        return jsonify({"status": "running"}), 200
    else:
        return jsonify({"status": "stopped"}), 204

def run_collect_and_process():
    """
    Runs collect.py and process.py of the original 
    news_article_container repo on feeds from feeds.txt.
    The lock file is to make exporting wait. Called by start_fetch().
    """
    if os.path.exists(LOCK_FILE):
        print("Processing is already active.")
        return

    try:
        with open(LOCK_FILE, 'w', encoding='utf-8') as f:
            f.write('processing')

        result = subprocess.run(['python3', 'collect.py'], cwd=f'./{FETCHER_FOLDER}', capture_output=True, check=True, text=True)
        if result.stdout:
            logger.info(result.stdout.strip())
        result = subprocess.run(['python3', 'process.py'], cwd=f'./{FETCHER_FOLDER}', capture_output=True, check=True, text=True)
        if result.stdout:
            logger.info(result.stdout.strip())

    except subprocess.CalledProcessError as e:
        print("Error: ", e.stderr)
    except Exception as e:
        logger.error("Error in run_collect_and_process: %s", e)
    finally:
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)
