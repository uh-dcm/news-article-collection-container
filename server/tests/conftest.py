"""
This sets configurations for test functions.
"""
# pylint: disable=wrong-import-position,redefined-outer-name
import os
import sys
import shutil
import pytest
from sqlalchemy.exc import SQLAlchemyError

# this makes Pytest understand the working directory for the test imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# general, main part of configurations for tests begins here
from app import create_app
from configs.db_config import get_engine
from configs.scheduler_config import shutdown_scheduler
from tests.database_filler import fill_test_database

@pytest.fixture(scope='module')
def app():
    """
    Creates a new app instance for testing.
    """
    app = create_app(testing=True)
    yield app
    with app.app_context():
        shutdown_scheduler()

@pytest.fixture(scope='module')
def client(app):
    """
    Creates a test client for the app.
    """
    return app.test_client()

@pytest.fixture(scope='module')
def engine(app):
    """
    Engine fixture. Used as a parameter.
    """
    with app.app_context():
        engine = get_engine()
        yield engine
        engine.dispose()

@pytest.fixture(scope='function')
def setup_and_teardown(engine):
    """
    Files and database setup fixture.
    Used as a pytest.mark.usefixtures above the tests.
    Can also be used as a parameter, but Pylint notes of unused variable.
    """
    base_dir = os.path.abspath('test-rss-fetcher')
    data_dir = os.path.join(base_dir, 'data')

    os.makedirs(data_dir, exist_ok=True)
    with open(os.path.join(data_dir, 'feeds.txt'), 'w', encoding='utf-8') as f:
        f.write('')

    with open(os.path.join(base_dir, 'collect.py'), 'w', encoding='utf-8') as f:
        f.write('print("Bla bla bla collect script")')

    with open(os.path.join(base_dir, 'process.py'), 'w', encoding='utf-8') as f:
        f.write('print("Bla bla bla process script")')

    conn = engine.connect()
    trans = conn.begin()
    fill_test_database(conn)

    yield conn

    try:
        trans.rollback()
    except SQLAlchemyError:
        pass
    finally:
        conn.close()

    engine.dispose()

    shutil.rmtree(base_dir)
