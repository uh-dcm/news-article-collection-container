"""
This sets configurations for test functions.
"""
import os
import sys
import shutil
import pytest

# since conftest is run first, the following setups are to be run before app import

@pytest.fixture(scope='session', autouse=True)
def reset_flask_env():
    """
    Resets to original FLASK_ENV after tests.
    """
    original_flask_env = os.environ.get('FLASK_ENV')

    yield

    if original_flask_env is None:
        os.environ.pop('FLASK_ENV', None)
    else:
        os.environ['FLASK_ENV'] = original_flask_env

def setup_testing_environment():
    """
    Sets FLASK_ENV to testing.
    """
    os.environ['FLASK_ENV'] = 'testing'

    if os.getenv('FLASK_ENV') != 'testing':
        pytest.exit("FLASK_ENV is not set to 'testing'. Exiting test suite.")

setup_testing_environment()

# this makes Pytest understand the working directory for the test imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# general, main part of configurations for tests begins here
from app import app, engine as app_engine
from scheduler_config import scheduler
from tests.database_filler import fill_test_database

@pytest.fixture(scope='module')
def engine():
    return app_engine

@pytest.fixture(scope='function')
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:  # pylint: disable=redefined-outer-name
        yield client

@pytest.fixture(scope='function')
def setup_and_teardown(engine):  # pylint: disable=redefined-outer-name
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
    fill_test_database(conn)

    for job in scheduler.get_jobs():
        scheduler.remove_job(job.id)

    yield conn

    conn.close()
    engine.dispose()

    if scheduler.running:
        scheduler.shutdown()

    shutil.rmtree('test-rss-fetcher')
