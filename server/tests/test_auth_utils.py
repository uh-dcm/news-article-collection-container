"""
Tests for auth_utils.py, namely just jwt_required_conditional().
"""
# pylint: disable=import-outside-toplevel, redefined-outer-name
from unittest.mock import patch, MagicMock
import pytest

@pytest.fixture
def mock_auth_utils():
    """Mocking absolutely everything so we don't accidentally run the regular app."""
    mock_current_app = MagicMock()
    mock_current_app.config = {'TESTING': False}
    mock_jwt_required = MagicMock()

    with patch.dict('sys.modules', {'flask': MagicMock(), 'flask_jwt_extended': MagicMock()}):
        with patch('src.utils.auth_utils.current_app', mock_current_app), \
             patch('src.utils.auth_utils.jwt_required', mock_jwt_required):

            from src.utils.auth_utils import jwt_required_conditional
            yield (
                jwt_required_conditional,
                mock_current_app.config,
                mock_jwt_required
            )

def test_jwt_required_conditional_production(mock_auth_utils):
    """Tests jwt_required_conditional() in non-testing regular run."""
    jwt_required_conditional, config, mock_jwt_required = mock_auth_utils
    config['TESTING'] = False

    @jwt_required_conditional
    def test_func():
        return "Function called"

    test_func()

    mock_jwt_required.assert_called_once()

def test_jwt_required_conditional_testing(mock_auth_utils):
    """Tests jwt_required_conditional() in testing."""
    jwt_required_conditional, config, mock_jwt_required = mock_auth_utils
    config['TESTING'] = True

    @jwt_required_conditional
    def test_func():
        return "Function called"

    result = test_func()

    assert result == "Function called"
    mock_jwt_required.assert_not_called()

# Test that the jwt_required_conditional decorator can handle 
# roles, exceptions, and token expiration.

# Test for a function that requires a specific role:
def test_jwt_required_conditional_with_role(mock_auth_utils):
    #Tests jwt_required_conditional() with a specific role.
    jwt_required_conditional, config, mock_jwt_required = mock_auth_utils
    config['TESTING'] = False

    @jwt_required_conditional(roles=['admin'])
    def test_func():
        return "Admin function called"

    test_func()

    mock_jwt_required.assert_called_once()

# Test for a function that handles exceptions:
def test_jwt_required_conditional_exception(mock_auth_utils):
    # Tests jwt_required_conditional() handling exceptions.
    jwt_required_conditional, config, mock_jwt_required = mock_auth_utils
    config['TESTING'] = False

    @jwt_required_conditional
    def test_func():
        raise Exception("Test exception")

    with pytest.raises(Exception, match="Test exception"):
        test_func()

    mock_jwt_required.assert_called_once()

# Test for a function that checks token expiration:
def test_jwt_required_conditional_token_expired(mock_auth_utils):
    # Tests jwt_required_conditional() with an expired token.
    jwt_required_conditional, config, mock_jwt_required = mock_auth_utils
    config['TESTING'] = False

    @jwt_required_conditional
    def test_func():
        return "Function called"

    # Simulate token expiration
    mock_jwt_required.side_effect = Exception("Token has expired")

    with pytest.raises(Exception, match="Token has expired"):
        test_func()

    mock_jwt_required.assert_called_once()
    