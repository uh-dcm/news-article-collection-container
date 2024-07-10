"""
This has basic scheduler config. The init_scheduler() and Config are used by app.py.
The scheduler itself is used for proper scheduling by content_fetcher.py.
Split into its own file for testing import purposes.
"""
from flask_apscheduler import APScheduler

class Config:
    SCHEDULER_API_ENABLED = True

scheduler = APScheduler()

def init_scheduler(app):
    scheduler.init_app(app)
    scheduler.start()
