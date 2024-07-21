"""
This handles logs.
"""
import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    """
    Logging handling for factory style app.
    """
    # Setup log folder
    log_dir = os.path.join(app.config['FETCHER_FOLDER'], 'data', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file_path = os.path.join(log_dir, 'errors.log')

    # Configure a logger
    formatter = logging.Formatter(
        '%(asctime)s - %(filename)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S'
    )

    # Configure and setup a file handler and a formatter
    # With RotatingFileHandler, when the log file is filled, it is closed and renamed
    file_handler = RotatingFileHandler(log_file_path, maxBytes=1024*1024*10, backupCount=5)
    file_handler.setLevel(logging.ERROR)
    file_handler.setFormatter(formatter)

    # Setup StreamHandler to display the log output in the terminal
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    stream_handler.setFormatter(formatter)

    # Confirm logger handlers
    app.logger.handlers.clear()
    app.logger.addHandler(file_handler)
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(logging.INFO)

    return log_file_path

__all__ = ['setup_logging']
