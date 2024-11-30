"""
This handles fetching routes, schedules fetching and
manages collect.py and process.py. Called by routes.py.
"""
import os
import subprocess
from flask import jsonify

from src.utils.resource_management import scheduler
from src.utils.processing_status import ProcessingStatus

def start_fetch():
    """
    Schedules the fetching job to run at five minute intervals, starting now.
    Uses run_collect_and_process(). Called by routes.init_routes() for route /api/start.
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
    Called by routes.init_routes() for route /api/stop.
    """
    if scheduler.get_job('collect_and_process'):
        scheduler.remove_job('collect_and_process')
        return jsonify({"status": "stopped"}), 200
    else:
        return jsonify({"status": "it was not running"}), 409

def get_fetch_status():
    """
    Asks scheduler the status of the job.
    Called by routes.init_routes() for route /api/status.
    """
    if scheduler.get_job('collect_and_process'):
        return jsonify({"status": "running"}), 200
    else:
        return jsonify({"status": "stopped"}), 204

# note that flask-apscheduler ran functions can only handle app context via scheduler.app.function
# whereas flask import current_app, then current_app.function doesn't work
def run_collect_and_process():
    """
    Runs collect.py and process.py of the original 
    news_article_container repo on feeds from feeds.txt.
    The processing status is to make exporting wait. Called by start_fetch().
    """
    if ProcessingStatus.get_status():
        scheduler.app.logger.info("Processing is already active.")
        return

    if not os.path.exists(
        os.path.join(scheduler.app.config['FETCHER_FOLDER'], 'data', 'feeds.txt')
    ):
        scheduler.app.logger.info("Fetch attempted without feeds")
        return

    try:
        ProcessingStatus.set_status(True)
        run_subprocess('collect.py')
        run_subprocess('process.py')
    except Exception:
        scheduler.app.logger.exception("Error in run_collect_and_process")
    finally:
        ProcessingStatus.set_status(False)

def run_subprocess(script_name):
    """
    The actual, once repeated subprocess run with logging for run_collect_and_process().
    The unique logging style is due to how the subprocess calls return meta info.
    """
    try:
        result = subprocess.run(
            ['python3', script_name],
            cwd=scheduler.app.config['FETCHER_FOLDER'],
            capture_output=True,
            check=True,
            text=True
        )
        if result.stdout:
            scheduler.app.logger.info(
                "%s output:\n%s",
                script_name,
                result.stdout.strip(),
                extra={'script_name': script_name}
            )
        if result.stderr:
            scheduler.app.logger.error(
                "%s error:\n%s",
                script_name,
                result.stderr.strip(),
                extra={'script_name': script_name}
            )
    except subprocess.CalledProcessError as e:
        scheduler.app.logger.error(
            "%s failed with return code %d:\n%s",
            script_name,
            e.returncode,
            e.stderr.strip(),
            extra={'script_name': script_name}
        )
        raise
