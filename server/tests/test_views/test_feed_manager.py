"""
Tests feed_manager.py route responses and functions.
"""
# Added test cases:
# Test for Empty Feed URL List: Ensures the system handles an empty list of feed URLs.
# Test for Duplicate Feed URLs: Verifies the system’s behavior when duplicate feed URLs are provided.
# Test for Removing Feed URLs: Checks if feed URLs can be removed correctly.
# Test for Invalid URL Format: Ensures the system handles invalid URL formats properly.

import pytest

def test_get_feed_urls(client):
    """Tests getting feed urls, which returns empty list if there is no feeds.txt."""
    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.usefixtures("setup_and_teardown")
def test_set_feed_urls(client):
    """
    Tests setting and getting specific feed urls from feeds.txt.
    Note that it uses the setup fixture.
    """
    response = client.post(
        '/api/set_feed_urls',
        json={"feedUrls": ["https://www.blabla.com/feed/"]}
    )
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert "https://www.blabla.com/feed/" in response.json

def test_set_feed_urls_invalid_data(client):
    """Tests invalid data entry for setting feed urls."""
    response = client.post('/api/set_feed_urls', data="invalid data")
    assert response.status_code == 415
    
# Ensures the system handles an empty list of feed URLs.
@pytest.mark.usefixtures("setup_and_teardown")
def test_set_empty_feed_urls(client):
    """Tests setting an empty list of feed urls."""
    response = client.post(
        '/api/set_feed_urls',
        json={"feedUrls": []}
    )
    assert response.status_code == 200
    assert response.json['message'] == "Feed URLs list cannot be empty."

# Verifies the system’s behavior when duplicate feed URLs are provided.
@pytest.mark.usefixtures("setup_and_teardown")
def test_set_duplicate_feed_urls(client):
    """Tests setting duplicate feed urls."""
    response = client.post(
        '/api/set_feed_urls',
        json={"feedUrls": ["https://www.blabla.com/feed/", "https://www.blabla.com/feed/"]}
    )
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert response.json.count("https://www.blabla.com/feed/") == 1

# Checks if feed URLs can be removed correctly.
@pytest.mark.usefixtures("setup_and_teardown")
def test_remove_feed_urls(client):
    """Tests removing feed urls."""
    response = client.post(
        '/api/set_feed_urls',
        json={"feedUrls": ["https://www.blabla.com/feed/"]}
    )
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.post(
        '/api/set_feed_urls',
        json={"feedUrls": []}
    )
    assert response.status_code == 200
    assert response.json['status'] == "success"

    response = client.get('/api/get_feed_urls')
    assert response.status_code == 200
    assert response.json == []

# Invalid URL Format: Ensures the system handles invalid URL formats properly.
@pytest.mark.usefixtures("setup_and_teardown")
def test_set_invalid_url_format(client):
    """Tests setting feed urls with invalid URL format."""
    response = client.post(
        '/api/set_feed_urls',
        json={"feedUrls": ["invalid-url"]}
    )
    assert response.status_code == 200
    assert response.json['message'] == "Invalid URL format: invalid-url"
