"""
This schedules fetching and manages collect.py and process.py. Called by app.py.
"""
import os
import subprocess
from flask import jsonify, current_app

from configs.scheduler_config import scheduler
from configs.db_config import ProcessingStatus

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
    if ProcessingStatus.get_status():
        current_app.logger.info("Processing is already active.")
        return

    if not os.path.exists(f'./{current_app.config['FETCHER_FOLDER']}/data/feeds.txt'):
        current_app.logger.info("Fetch attempted without feeds")
        return

    try:
        ProcessingStatus.set_status(True)
        run_subprocess('collect.py')
        run_subprocess('process.py')
    except Exception as e:
        current_app.logger.error("Error in run_collect_and_process: %s", e)
    finally:
        ProcessingStatus.set_status(False)

def run_subprocess(script_name):
    """
    The actual, once repeated subprocess run with logging for run_collect_and_process().
    """
    result = subprocess.run(
        ['python3', script_name],
        cwd=f'./{current_app.config['FETCHER_FOLDER']}',
        capture_output=True,
        check=True,
        text=True
    )
    if result.stdout:
        current_app.logger.info(
            "%s output:\n%s",
            script_name,
            result.stdout.strip(),
            extra={'script_name': script_name}
        )
    if result.stderr:
        current_app.logger.error(
            "%s error:\n%s",
            script_name,
            result.stderr.strip(),
            extra={'script_name': script_name}
        )
