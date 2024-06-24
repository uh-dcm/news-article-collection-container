import os
import sys
import pytest
from sqlalchemy import text

# path needs to be before app import, at least in local tests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, engine, STOP_EVENT  # noqa: E402

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['FLASK_ENV'] = 'testing'
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def setup_and_teardown():
    os.makedirs('./rss-fetcher/data', exist_ok=True)
    with open('./rss-fetcher/data/feeds.txt', 'w') as f:
        f.write('')
    
    with open('./rss-fetcher/collect.py', 'w') as f:
        f.write('print("Bla bla bla collect script")')
    
    with open('./rss-fetcher/process.py', 'w') as f:
        f.write('print("Bla bla bla process script")')
    
    conn = engine.connect()
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY,
            time TEXT,
            url TEXT,
            full_text TEXT
        )
    """))
    conn.execute(text("""
        INSERT INTO articles (time, url, full_text) VALUES
        ('2016-06-06 09:09:09', 'https://blabla.com/article', 'Bla bla full text')
    """))
    conn.close()
    
    yield

    STOP_EVENT.set()

    # doesn't seem to work well
    # leaves rss-fetcher behind
    try:
        os.remove('./rss-fetcher/data/feeds.txt')
        os.rmdir('./rss-fetcher/data')
        os.remove('./rss-fetcher/collect.py')
        os.remove('./rss-fetcher/process.py')
        os.rmdir('./rss-fetcher')
    except OSError:
        pass

    conn = engine.connect()
    conn.execute(text("DROP TABLE IF EXISTS articles"))
    conn.close()

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
    response = client.post('/api/set_feed_urls', json={"feedUrls": ["https://www.blabla.com/feed/"]})
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert "https://www.blabla.com/feed/" in response.json

def test_fetching_status(client):
    client.post('/api/start')
    response = client.get('/api/status')
    assert response.status_code == 200
    assert response.json['status'] == "running"

    client.post('/api/stop')
    response = client.get('/api/status')
    assert response.status_code == 400
    assert response.json['status'] == "stopped"

def test_download_articles(client):
    response = client.get('/api/articles')
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        assert response.content_type == 'application/json'

def test_search_articles(client):
    response = client.get('/api/articles/search', query_string={'searchQuery': 'blabla'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

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

def test_start_fetching_already_running(client):
    client.post('/api/start')
    response = client.post('/api/start')
    assert response.status_code == 409
    assert response.json['status'] == "already running"

def test_stop_fetching_not_running(client):
    client.post('/api/stop')
    response = client.post('/api/stop')
    assert response.status_code == 409
    assert response.json['status'] == "it was not running"

def test_download_articles_no_data(client):
    response = client.get('/api/articles')
    assert response.status_code == 400
