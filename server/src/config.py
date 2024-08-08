"""
Sets basic or testing config for the app.
"""
# pylint: disable=invalid-name
import os
from datetime import timedelta
from dataclasses import dataclass
import secrets

@dataclass
class Config:
    """Regular, non-testing config."""
    TESTING: bool = False
    SERVER_ROOT: str = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    FETCHER_FOLDER: str = os.path.join(SERVER_ROOT, 'rss-fetcher')
    DATABASE_URL: str = f'sqlite:///{FETCHER_FOLDER}/data/data.db'

    # TODO: fix it so it works with tests
    # WARNING: breaks for tests because path is not set correctly
    
    # get the secret key from a file if it exists
    if os.path.exists(os.path.join(FETCHER_FOLDER, 'data', 'secret_key.txt')):
        with open(os.path.join(FETCHER_FOLDER, 'data', 'secret_key.txt'), 'r', encoding='utf-8') as f:
            SECRET_KEY: str = f.read().strip()
    else:
        # make a key!
        SECRET_KEY: str = secrets.token_hex(32)
        # write it to a file
        with open(os.path.join(FETCHER_FOLDER, 'data', 'secret_key.txt'), 'w', encoding='utf-8') as f:
            f.write(SECRET_KEY)

    # get the JWT secret key from a file if it exists
    if os.path.exists(os.path.join(FETCHER_FOLDER, 'data', 'jwt_secret_key.txt')):
        with open(os.path.join(FETCHER_FOLDER, 'data', 'jwt_secret_key.txt'), 'r', encoding='utf-8') as f:
            JWT_SECRET_KEY: str = f.read().strip()
    else:
        # make a key!
        JWT_SECRET_KEY: str = secrets.token_hex(32)
        # write it to a file
        with open(os.path.join(FETCHER_FOLDER, 'data', 'jwt_secret_key.txt'), 'w', encoding='utf-8') as f:
            f.write(JWT_SECRET_KEY)
    
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(minutes=60)

@dataclass
class TestConfig(Config):
    """Testing config that inherits the main config and overrides some settings."""
    TESTING: bool = True
    FETCHER_FOLDER: str = os.path.join(Config.SERVER_ROOT, 'test-rss-fetcher')
    DATABASE_URL: str = 'sqlite:///:memory:'
