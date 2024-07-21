"""
Sets basic config for the app, mainly testing mode.
"""
# pylint: disable=invalid-name
import os
from dataclasses import dataclass

@dataclass
class Config:
    """
    Regular, non-testing config.
    """
    TESTING: bool = False
    DATABASE_URL: str = 'sqlite:///./rss-fetcher/data/data.db'
    FETCHER_FOLDER: str = 'rss-fetcher'
    JWT_SECRET_KEY: str = os.environ.get(
        'JWT_SECRET_KEY', "your_secret_key_here_change_this"
    )  # TODO: change this

@dataclass
class TestConfig(Config):
    """
    Testing config that inherits the main config and overrides some settings.
    """
    TESTING: bool = True
    DATABASE_URL: str = 'sqlite:///:memory:'
    FETCHER_FOLDER: str = 'test-rss-fetcher'
