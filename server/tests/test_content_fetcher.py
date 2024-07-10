"""
Tests content_fetcher.py route responses and functions.
"""
import os
import subprocess
from unittest.mock import patch
import pytest

from data_acquisition.content_fetcher import run_collect_and_process
from app import LOCK_FILE

@pytest.fixture
def mock_subprocess():
    def mock_run(*args, **kwargs):  # pylint: disable=unused-argument
        class CompletedProcess:
            returncode = 0
            stdout = "Mock subprocess output"
            stderr = "Mock subprocess error output"
        return CompletedProcess()
    with patch('subprocess.run', side_effect=mock_run) as mock:
        yield mock

def test_start_fetch(client, mock_subprocess):  # pylint: disable=redefined-outer-name
    response = client.post('/api/start')
    assert response.status_code == 201
    assert response.json['status'] == "started"
    mock_subprocess.assert_called()

def test_start_fetch_already_running(client):
    client.post('/api/start')
    response = client.post('/api/start')
    assert response.status_code == 409
    assert response.json['status'] == "already running"

def test_run_collect_and_process_subprocess_error():
    with patch('subprocess.run') as mock_subprocess_run:
        mock_subprocess_run.side_effect = subprocess.CalledProcessError(
            returncode=1,
            cmd='python3 collect.py',
            output='',
            stderr='Mocked error'
        )
        run_collect_and_process()

        assert mock_subprocess_run.call_count == 1

    assert not os.path.exists(LOCK_FILE)

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

def test_fetch_status(client, mock_subprocess):  # pylint: disable=redefined-outer-name
    response = client.post('/api/start')
    assert response.status_code == 201

    response = client.get('/api/status')
    assert response.status_code == 200
    assert response.json['status'] == "running"
    mock_subprocess.assert_called()

    response = client.post('/api/stop')
    assert response.status_code == 200

    response = client.get('/api/status')
    assert response.status_code == 204
