"""
This sets configurations for test functions.
"""
import os
import shutil
import pytest
import config
from src.app import create_app
from tests.database_filler import fill_test_database
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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
def setup_and_teardown(engine):
    """
    Files and database setup fixture.
    Used as a pytest.mark.usefixtures above the tests.
    """
    base_dir = config.Config.FETCHER_FOLDER
    data_dir = os.path.join(base_dir, "data", "")

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

# Useful fixtures:
class Article:
    def __init__(self, id, content):
        self.id = id
        self.content = content

""" @pytest.fixture
def setup_and_teardown_for_large_dataset(engine):
    base_dir = config.Config.FETCHER_FOLDER
    data_dir = os.path.join(base_dir, 'data')

    os.makedirs(data_dir, exist_ok=True)

    with open(os.path.join(data_dir, 'feeds.txt'), 'w', encoding='utf-8') as f:
        f.write('')

    with open(os.path.join(base_dir, 'collect.py'), 'w', encoding='utf-8') as f:
        f.write('print("Bla bla bla collect script")')

    with open(os.path.join(base_dir, 'process.py'), 'w', encoding='utf-8') as f:
        f.write('print("Bla bla bla process script")')

    try:
        conn = engine.connect()
        trans = conn.begin()
        fill_test_database(conn)
        
        # Populate the database with a large dataset
        articles = [Article(id=i, content="Some content") for i in range(150)]
        
        # Use the session to add and commit the articles
        Session = sessionmaker(bind=engine)
        session = Session()
        session.add_all(articles)
        session.commit()
        trans.commit()
    except Exception as e:
        trans.rollback()
        raise e
    finally:
        conn.close()

    yield

    # Teardown: Clean up the data directory after the test
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)

 """
Base = declarative_base()
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)

Base = declarative_base()

@pytest.fixture(scope='function')
def setup_and_teardown_user_exists_false(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_user_exists_false(session):
    user = session.query(User).filter_by(name='Test User').first()
    assert user is None

@pytest.fixture(scope='function')
def setup_and_teardown_user_exists_true(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_user_exists_true(session):
    session.add(User(name='Test User'))
    session.commit()

    user = session.query(User).filter_by(name='Test User').first()
    assert user is not None

# The clean_database fixture ensures that the database is cleaned up after each test, preventing side effects between tests.
# Add a fixture for cleaning up the database after each test:
""" @pytest.fixture(scope='function', autouse=True)
def clean_database(engine):
    #Cleans up the database after each test.
    connection = engine.connect()
    transaction = connection.begin()

    yield

    transaction.rollback() #this need the rollback parameter to be set in sqlite
    connection.close() """

@pytest.fixture(scope='function', autouse=True)
def clean_database(engine):
    """Cleans up the database after each test."""
    connection = engine.connect()

    # Create a session bound to the connection
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    # Rollback the session and close the connection after the test
    session.rollback()
    session.close()
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
