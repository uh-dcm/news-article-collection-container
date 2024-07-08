"""
Tests basic app.py route responses and functions.
"""
import os
from unittest.mock import patch, mock_open

def test_flask_env():
    assert os.getenv('FLASK_ENV') == 'testing'

def test_serve_index(client):
    response = client.get('/')
    assert response.status_code == 200 or response.status_code == 404
    if response.status_code == 200:
        assert b"News article collector" in response.data

def test_serve_static_file(client):
    response = client.get('/static/blabla.css')
    assert response.status_code == 404

def test_get_error_logs(client):
    with patch('builtins.open', mock_open(read_data="Error 1\nError 2")):
        response = client.get('/api/error_logs')
        assert response.status_code == 200
        assert response.json['logs'] == ["Error 1", "Error 2"]

def test_get_error_logs_file_not_found(client):
    with patch('builtins.open', side_effect=FileNotFoundError):
        response = client.get('/api/error_logs')
        assert response.status_code == 500
        assert 'error' in response.json
