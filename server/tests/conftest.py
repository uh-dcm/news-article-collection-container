"""
This sets configurations for test functions.
"""
import os
import shutil
import pytest
from sqlalchemy.exc import SQLAlchemyError

from src.app import create_app
from tests.database_filler import fill_test_database

@pytest.fixture(scope='module', name='app')
def app_fixture():
    """Creates a new app instance for testing. Used as a parameter."""
    application = create_app(testing=True)
    yield application

@pytest.fixture(scope='module', name='client')
def client_fixture(app):
    """Creates a test client for the app. Used as a parameter."""
    return app.test_client()

@pytest.fixture(scope='module', name='engine')
def engine_fixture(app):
    """Engine fixture. Used as a parameter."""
    with app.app_context():
        yield app.db_engine

@pytest.fixture(scope='module', name='app_config')
def app_config_fixture(app):
    """Config fixture. Used as a parameter."""
    return app.config

@pytest.fixture(scope='function')
def setup_and_teardown(engine, app_config):
    """
    Files and database setup fixture.
    Used as a pytest.mark.usefixtures above the tests.
    Can also be used as a parameter, but Pylint notes of unused variable.
    """
    base_dir = app_config['FETCHER_FOLDER']
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
