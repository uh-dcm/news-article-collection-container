"""
Tests for auth_utils.py, namely just one for jwt_required_conditional().
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
    mock_jwt_required.return_value = lambda f: lambda *args, **kwargs: "JWT required"

    with patch.dict('sys.modules', {'flask': MagicMock()}):
        with patch('src.utils.auth_utils.current_app', mock_current_app), \
            patch('src.utils.auth_utils.jwt_required', mock_jwt_required):

            from src.utils.auth_utils import jwt_required_conditional
            yield jwt_required_conditional, mock_current_app.config

@pytest.mark.parametrize("testing,expected", [
    (True, "Function called"),
    (False, "JWT required")
])
def test_jwt_required_conditional(mock_auth_utils, testing, expected):
    """Tests jwt_required_conditional()."""
    jwt_required_conditional, config = mock_auth_utils
    config['TESTING'] = testing

    @jwt_required_conditional
    def test_func():
        return "Function called"

    result = test_func()
    assert result == expected
