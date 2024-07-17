"""
Tests feed_manager.py route responses and functions.
"""
import pytest

def test_get_feed_urls(client):
    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.usefixtures("setup_and_teardown")
def test_set_feed_urls(client):
    response = client.post('/api/set_feed_urls', json={"feedUrls": ["https://www.blabla.com/feed/"]})
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert "https://www.blabla.com/feed/" in response.json

def test_set_feed_urls_invalid_data(client):
    response = client.post('/api/set_feed_urls', data="invalid data")
    assert response.status_code == 415
