"""
Tests log_operations.py route responses and functions.
"""
from unittest.mock import patch, mock_open

def test_get_error_logs(client):
    """Tests getting error logs."""
    with patch('builtins.open', mock_open(read_data="Error 1\nError 2")):
        response = client.get('/api/error_logs')
        assert response.status_code == 200
        assert response.json['logs'] == ["Error 1", "Error 2"]

def test_get_error_logs_file_not_found(client):
    """Tests getting error logs with no error logs."""
    with patch('builtins.open', side_effect=FileNotFoundError):
        response = client.get('/api/error_logs')
        assert response.status_code == 500
        assert 'error' in response.json
