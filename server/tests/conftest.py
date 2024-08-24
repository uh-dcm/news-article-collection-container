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

    yield

# Useful fixtures:

@pytest.fixture
def setup_and_teardown_for_large_dataset(client):
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
    # Populate the database with a large dataset
    articles = [Article(title=f"Article {i}", content="Some content") for i in range(150)]
    db.session.bulk_save_objects(articles)
    db.session.commit()
    yield conn

    try:
        trans.rollback()
    except SQLAlchemyError:
        pass
    
    finally:
        conn.close()
        db.session.remove()
        engine.dispose()
        shutil.rmtree(base_dir)
    yield


@pytest.fixture
def setup_and_teardown_user_exists_false(client):
    # Clear the user data before running the test
    User.query.delete()
    db.session.commit()
    yield
    # Teardown code if needed
    #db.session.remove()
    #db.drop_all()


@pytest.fixture
def setup_and_teardown_user_exists_true(client):
    # Clear the user data before running the test
    # User.query.delete()
    # db.session.commit()
    yield
    # Teardown code if needed
    #db.session.remove()
    #db.drop_all()


# The clean_database fixture ensures that the database is cleaned up after each test, preventing side effects between tests.
# Add a fixture for cleaning up the database after each test:
@pytest.fixture(scope='function', autouse=True)
def clean_database(engine):
    """Cleans up the database after each test."""
    connection = engine.connect()
    transaction = connection.begin()

    yield

    transaction.rollback() #this need the rollback parameter to be set in sqlite
    connection.close()

# a fixture for setting up a temporary directory for file operations:
# ensures that no files are left behind after tests.
@pytest.fixture(scope='function')
def temp_dir(tmp_path):
    #Creates a temporary directory for file operations.
    temp_directory = tmp_path / "test_data"
    temp_directory.mkdir()
    yield temp_directory
    shutil.rmtree(temp_directory)

# a fixture for mocking environment variables:
@pytest.fixture(scope='function')
def mock_env_vars(monkeypatch):
    #Mocks environment variables for testing.
    monkeypatch.setenv('FLASK_ENV', 'testing')
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    yield
    monkeypatch.undo()

@pytest.fixture(scope='function')
def setup_and_teardown_with_temp_dir(engine, app_config, temp_dir):
    # Files and database setup fixture.
    # Used as a pytest.mark.usefixtures above the tests.
    base_dir = temp_dir
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

