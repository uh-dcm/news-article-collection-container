"""
Tests for auth_utils.py.
"""
# pylint: disable=import-outside-toplevel, redefined-outer-name
from unittest.mock import patch, MagicMock
import pytest

@pytest.fixture
def mock_auth_utils():
    """Mocking absolutely everything so we don't accidentally run the regular app."""
    mock_current_app = MagicMock()
    mock_current_app.config = {'TESTING': False}
    mock_verify_jwt_in_request = MagicMock()
    mock_jsonify = MagicMock()

    with patch.dict('sys.modules', {'flask': MagicMock()}):
        with patch('src.utils.auth_utils.current_app', mock_current_app), \
             patch('src.utils.auth_utils.verify_jwt_in_request', mock_verify_jwt_in_request), \
             patch('src.utils.auth_utils.jsonify', mock_jsonify):

            from src.utils.auth_utils import jwt_required_conditional
            yield (
                jwt_required_conditional,
                mock_current_app.config,
                mock_verify_jwt_in_request,
                mock_jsonify
            )

def test_jwt_required_conditional_success(mock_auth_utils):
    """Tests jwt_required_conditional() working."""
    jwt_required_conditional, config, mock_verify_jwt_in_request, mock_jsonify = mock_auth_utils
    config['TESTING'] = False

    mock_verify_jwt_in_request.side_effect = None

    @jwt_required_conditional
    def test_func():
        return "Function called"

    result = test_func()

    assert result == "Function called"
    mock_verify_jwt_in_request.assert_called_once()
    mock_jsonify.assert_not_called()

def test_jwt_required_conditional_error(mock_auth_utils):
    """Tests jwt_required_conditional() error situation."""
    jwt_required_conditional, config, mock_verify_jwt_in_request, mock_jsonify = mock_auth_utils
    config['TESTING'] = False

    error_message = "JWT validation failed"
    mock_verify_jwt_in_request.side_effect = Exception(error_message)
    mock_jsonify.return_value = "JWT error response"

    @jwt_required_conditional
    def test_func():
        return "Function called"

    result = test_func()

    mock_jsonify.assert_called_once_with(
        {"valid": False, "message": f"Error in jwt_required_conditional: {error_message}"}
    )
    assert result == ("JWT error response", 401)

def test_validate_token_error(mock_auth_utils):
    """Tests validate_token() error situation."""
    _, _, mock_verify_jwt_in_request, mock_jsonify = mock_auth_utils

    error_message = "JWT validation failed"
    mock_verify_jwt_in_request.side_effect = Exception(error_message)
    mock_jsonify.return_value = "JWT error response"

    from src.utils.auth_utils import validate_token

    result = validate_token()

    mock_jsonify.assert_called_once_with(
        {"valid": False, "message": f"Error in validate_token: {error_message}"}
    )
    assert result == ("JWT error response", 401)
