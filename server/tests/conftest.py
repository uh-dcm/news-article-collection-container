"""
This sets FLASK_ENV as testing for all test files.
"""
import os
import pytest

def pytest_configure(config):
    os.environ['FLASK_ENV'] = 'testing'

@pytest.fixture(scope='session', autouse=True)
def reset_flask_env():
    original_flask_env = os.environ.get('FLASK_ENV')
    
    yield

    if original_flask_env is None:
        os.environ.pop('FLASK_ENV', None)
    else:
        os.environ['FLASK_ENV'] = original_flask_env