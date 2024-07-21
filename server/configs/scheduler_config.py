"""
This has basic scheduler config. The init_scheduler() and Config are used by app.py.
The scheduler itself is used for proper scheduling by content_fetcher.py.
Split into its own file for testing import purposes.
"""
from flask_apscheduler import APScheduler

scheduler = APScheduler()

def init_scheduler(app):
    """
    Scheduler init function.
    """
    if not scheduler.running:
        scheduler.init_app(app)
        scheduler.start()

def shutdown_scheduler():
    """
    Scheduler shutdown function.
    """
    if scheduler.running:
        scheduler.shutdown()
