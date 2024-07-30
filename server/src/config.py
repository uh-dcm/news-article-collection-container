"""
Sets basic or testing config for the app.
"""
# pylint: disable=invalid-name
import os
from datetime import timedelta
from dataclasses import dataclass

@dataclass
class Config:
    """Regular, non-testing config."""
    TESTING: bool = False
    SERVER_ROOT: str = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    FETCHER_FOLDER: str = os.path.join(SERVER_ROOT, 'rss-fetcher')
    DATABASE_URL: str = f'sqlite:///{FETCHER_FOLDER}/data/data.db'
    JWT_SECRET_KEY: str = os.environ.get(
        'JWT_SECRET_KEY', "your_secret_key_here_change_this"
    )  # TODO: change this
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(minutes=60)

@dataclass
class TestConfig(Config):
    """Testing config that inherits the main config and overrides some settings."""
    TESTING: bool = True
    FETCHER_FOLDER: str = os.path.join(Config.SERVER_ROOT, 'test-rss-fetcher')
    DATABASE_URL: str = 'sqlite:///:memory:'
