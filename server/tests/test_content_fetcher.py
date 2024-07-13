"""
Tests content_fetcher.py route responses and functions.
"""
# verification check plus stderr extraction made old subprocess fault test moot
# and the mock not work right
#import pytest
#from unittest.mock import patch

#@pytest.fixture
#def mock_subprocess():
#    def mock_run(*args, **kwargs):  # pylint: disable=unused-argument
#        class CompletedProcess:
#            returncode = 0
#            stdout = "Mock subprocess output"
#            stderr = "Mock subprocess error output"
#        return CompletedProcess()
#    with patch('subprocess.run', side_effect=mock_run) as mock:
#        yield mock

def test_start_fetch(client):
    response = client.post('/api/start')
    assert response.status_code == 201
    assert response.json['status'] == "started"

def test_start_fetch_already_running(client):
    client.post('/api/start')
    response = client.post('/api/start')
    assert response.status_code == 409
    assert response.json['status'] == "already running"

def test_stop_fetch(client):
    client.post('/api/start')
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] in ["stopped", "it was not running"]

def test_stop_fetch_not_running(client):
    response = client.post('/api/stop')
    assert response.status_code == 409
    assert response.json['status'] == "it was not running"

    client.post('/api/start')
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] == "stopped"

def test_fetch_status(client):
    response = client.post('/api/start')
    assert response.status_code == 201

    response = client.get('/api/status')
    assert response.status_code == 200
    assert response.json['status'] == "running"

    response = client.post('/api/stop')
    assert response.status_code == 200

    response = client.get('/api/status')
    assert response.status_code == 204
