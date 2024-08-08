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

    SECRET_KEY: str = 'f3b256e9f5be4b5eaafe4b6e2f71c37120ab7c5b34c9d2d1f96e2ff6e3779184' # NOT RANDOM! these are just placeholders,
    # replaced with random values in app.py
    JWT_SECRET_KEY: str = '06d491bc8b8a46d1b34b3e743c2a91d4ec90d8b56b71f70c68a5d48a873ca0ad' # NOT RANDOM! these are just placeholders,
    # replaced with random values in app.py

    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(minutes=60)

@dataclass
class TestConfig(Config):
    """Testing config that inherits the main config and overrides some settings."""
    TESTING: bool = True
    FETCHER_FOLDER: str = os.path.join(Config.SERVER_ROOT, 'test-rss-fetcher')
    DATABASE_URL: str = 'sqlite:///:memory:'
