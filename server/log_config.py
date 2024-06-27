import logging
import os
from logging.handlers import RotatingFileHandler

os.makedirs(f"./logs/", exist_ok=True)
LOG_FILE_PATH = './logs/errors.log'

# Create and configure a logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configure and setup a file handler and a formatter
# With RotatingFileHandler, when the log file is filled, it is closed and renamed
handler = RotatingFileHandler(LOG_FILE_PATH, maxBytes=1024*1024*10, backupCount=5)
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


__all__ = ['logger', 'LOG_FILE_PATH']
