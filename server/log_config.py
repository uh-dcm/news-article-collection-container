"""
This handles logs.
"""
import logging
import os
from logging.handlers import RotatingFileHandler

from config import FETCHER_FOLDER

os.makedirs(f"./{FETCHER_FOLDER}/data/logs/", exist_ok=True)
LOG_FILE_PATH = f'./{FETCHER_FOLDER}/data/logs/errors.log'

# Create and configure a logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configure and setup a file handler and a formatter
# With RotatingFileHandler, when the log file is filled, it is closed and renamed
file_handler = RotatingFileHandler(LOG_FILE_PATH, maxBytes=1024*1024*10, backupCount=5)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# Setup StreamHandler to display the log output in the terminal
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

__all__ = ['logger', 'LOG_FILE_PATH']
