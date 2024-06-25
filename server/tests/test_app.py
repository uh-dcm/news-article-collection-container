"""
This has tests for app.py.
"""
import os
import sys
import time
import subprocess
from unittest.mock import patch
import shutil
import pytest
from database_filler import fill_test_database

# path needs to be before app import, at least in local tests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, engine, STOP_EVENT # pylint: disable=import-error

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def setup_and_teardown():
    base_dir = os.path.abspath('test-rss-fetcher')
    data_dir = os.path.join(base_dir, 'data')

    os.makedirs(data_dir, exist_ok=True)
    with open(os.path.join(data_dir, 'feeds.txt'), 'w') as f:
        f.write('')
    
    with open(os.path.join(base_dir, 'collect.py'), 'w') as f:
        f.write('print("Bla bla bla collect script")')
    
    with open(os.path.join(base_dir, 'process.py'), 'w') as f:
        f.write('print("Bla bla bla process script")')

    conn = engine.connect()
    fill_test_database(conn)
    conn.close()
    
    yield

    STOP_EVENT.set()

    shutil.rmtree('test-rss-fetcher')

@pytest.fixture
def mock_subprocess():
    def mock_run(*args, **kwargs):
        class CompletedProcess:
            returncode = 0
        return CompletedProcess()
    with patch('subprocess.run', side_effect=mock_run) as mock:
        yield mock

def test_start_fetching(client, mock_subprocess):
    response = client.post('/api/start')
    assert response.status_code == 201
    assert response.json['status'] in ["started", "already running"]
    mock_subprocess.assert_called()

def test_stop_fetching(client):
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] in ["stopped", "it was not running"]

def test_get_feed_urls(client):
    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_set_feed_urls(client):
    response = client.post('/api/set_feed_urls', json={"feedUrls": ["https://www.blabla.com/feed/"]})
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert "https://www.blabla.com/feed/" in response.json

# this needs some time or else it sometimes gives minor Error: None
def test_fetching_status(client, mock_subprocess):
    response = client.post('/api/start')
    assert response.status_code == 201
    time.sleep(0.1)

    response = client.get('/api/status')
    assert response.status_code == 200
    assert response.json['status'] == "running"
    mock_subprocess.assert_called()

    response = client.post('/api/stop')
    assert response.status_code == 200
    time.sleep(0.1)

    response = client.get('/api/status')
    assert response.status_code == 400
    assert response.json['status'] == "stopped"
    mock_subprocess.assert_called()

def test_download_articles(client):
    response = client.get('/api/articles')
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        assert response.content_type == 'application/json'

def test_download_articles_subprocess_error(client, mock_subprocess):
    def raise_error(*args, **kwargs):
        raise subprocess.CalledProcessError(1, 'cmd')
    mock_subprocess.side_effect = raise_error
    response = client.get('/api/articles')
    assert response.status_code == 400

def test_search_articles(client):
    response = client.get('/api/articles/search', query_string={'searchQuery': 'blabla'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_search_articles_error(client):
    with patch('app.connection.execute', side_effect=Exception("Database error")):
        response = client.get('/api/articles/search', query_string={'searchQuery': 'blabla'})
        assert response.status_code == 500
        assert response.json['status'] == "error"

def test_serve_index(client):
    response = client.get('/')
    assert response.status_code == 200 or response.status_code == 404
    if response.status_code == 200:
        assert b"News article collector" in response.data

def test_serve_static_file(client):
    response = client.get('/static/blabla.css')
    assert response.status_code == 404

def test_set_feed_urls_invalid_data(client):
    response = client.post('/api/set_feed_urls', data="invalid data")
    assert response.status_code == 415

def test_start_fetching_already_running(client, mock_subprocess):
    client.post('/api/start')
    response = client.post('/api/start')
    assert response.status_code == 409
    assert response.json['status'] == "already running"
    mock_subprocess.assert_called()

def test_stop_fetching_not_running(client):
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] in ["stopped", "it was not running"]

    response = client.post('/api/stop')
    assert response.status_code == 409
    assert response.json['status'] == "it was not running"

def test_download_articles_no_data(client):
    response = client.get('/api/articles')
    assert response.status_code == 400
