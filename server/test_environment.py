"""
This sets FLASK_ENV as testing for all test files. See pytest.ini.
"""
import os
import pytest

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

setup_testing_environment()
