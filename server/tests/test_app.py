from app import app
import os
import sys
from unittest.mock import patch
import pytest
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def setup_and_teardown():
    os.makedirs('./rss-fetcher/data', exist_ok=True)
    with open('./rss-fetcher/data/feeds.txt', 'w') as f:
        f.write('')
    
    yield

    try:
        os.remove('./rss-fetcher/data/feeds.txt')
        os.rmdir('./rss-fetcher')
    except OSError:
        pass

def test_start_fetching(client):
    response = client.post('/api/start')
    assert response.status_code == 201
    assert response.json['status'] in ["started", "already running"]

def test_stop_fetching(client):
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] in ["stopped", "it was not running"]

def test_get_feed_urls(client):
    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_set_feed_urls(client):
    response = client.post('/api/set_feed_urls', json={"feedUrls": ["https://www.androidauthority.com/feed/"]})
    assert response.status_code == 200
    assert response.json['status'] == "success"
