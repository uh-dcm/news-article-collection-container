"""
This handles fetching routes, schedules fetching and
manages collect.py and process.py. Called by routes.py.
"""
import os
import subprocess
from flask import jsonify, current_app

from src.utils.processing_status import ProcessingStatus

def start_fetch():
    """
    Schedules the fetching job to run at five minute intervals, starting now.
    Uses run_collect_and_process(). Called by routes.init_routes() for route /api/start.
    """
    if not current_app.scheduler.get_job('collect_and_process'):
        current_app.scheduler.add_job(
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
    Called by  Called by routes.init_routes() for route /api/stop.
    """
    if current_app.scheduler.get_job('collect_and_process'):
        current_app.scheduler.remove_job('collect_and_process')
        return jsonify({"status": "stopped"}), 200
    else:
        return jsonify({"status": "it was not running"}), 409

def get_fetch_status():
    """
    Asks scheduler the status of the job.
    Called by routes.init_routes() for route /api/status.
    """
    if current_app.scheduler.get_job('collect_and_process'):
        return jsonify({"status": "running"}), 200
    else:
        return jsonify({"status": "stopped"}), 204

def run_collect_and_process():
    """
    Runs collect.py and process.py of the original 
    news_article_container repo on feeds from feeds.txt.
    The processing status is to make exporting wait. Called by start_fetch().
    """
    if ProcessingStatus.get_status():
        current_app.logger.info("Processing is already active.")
        return

    if not os.path.exists(os.path.join(current_app.config['FETCHER_FOLDER'], 'data', 'feeds.txt')):
        current_app.logger.info("Fetch attempted without feeds")
        return

    try:
        ProcessingStatus.set_status(True)
        run_subprocess('collect.py')
        run_subprocess('process.py')
    except Exception:
        current_app.logger.exception("Error in run_collect_and_process")
    finally:
        ProcessingStatus.set_status(False)

def run_subprocess(script_name):
    """
    The actual, once repeated subprocess run with logging for run_collect_and_process().
    """
    try:
        result = subprocess.run(
            ['python3', script_name],
            cwd=current_app.config['FETCHER_FOLDER'],
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
    except subprocess.CalledProcessError as e:
        current_app.logger.error(
            "%s failed with return code %d:\n%s",
            script_name,
            e.returncode,
            e.stderr.strip(),
            extra={'script_name': script_name}
        )
        raise
