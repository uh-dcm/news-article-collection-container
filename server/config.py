"""
This checks FLASK_ENV to whether run test mode or regular.
"""
import os

# check whether to have test forms of db and fetcher folder
if os.getenv('FLASK_ENV') == 'testing':
    DATABASE_URL = 'sqlite:///:memory:'
    FETCHER_FOLDER = 'test-rss-fetcher'
else:
    DATABASE_URL = 'sqlite:///./rss-fetcher/data/data.db'
    FETCHER_FOLDER = 'rss-fetcher'