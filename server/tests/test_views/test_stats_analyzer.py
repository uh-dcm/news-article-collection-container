"""
Tests stats_analyzer.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_stats(client):
    """
    Tests that a stats call returns a jsonified list when the
    articles table exists. Uses db setup fixture.
    """
    response = client.get('/api/articles/statistics')
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) == 3

def test_get_stats_no_articles(client):
    """
    Tests getting stats without articles having been fetched.
    Note that this doesn't have the db setup fixture.
    """
    response = client.get('/api/articles/statistics')
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_get_stats_db_error(client):
    """Tests db error when getting stats."""
    with patch('src.utils.resource_management.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/statistics')
        assert response.status_code == 500
        assert response.json['message'] == (
            "Database error when getting statistics: Mock database error"
        )

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_text(client):
    """
    Tests getting full text of articles.
    """
    response = client.get('/api/articles/full_text')
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert all('full_text' in item for item in response.json)

def test_get_text_db_error(client):
    """Tests db error when getting full text."""
    with patch('src.utils.resource_management.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/full_text')
        assert response.status_code == 500
        assert response.json['message'] == (
            "Database error when getting text fields: Mock database error"
        )

def test_get_data_size(client):
    """
    Tests getting the size of the data.db file.
    """
    with patch('os.path.exists', return_value=True), \
         patch('os.path.getsize', return_value=1024 * 1024):  # 1 MB
        response = client.get('/api/data_size')
        assert response.status_code == 200
        assert response.json['size'] == "1.00 MB"

def test_get_data_size_no_file(client):
    """
    Tests getting the size when data.db doesn't exist.
    """
    with patch('os.path.exists', return_value=False):
        response = client.get('/api/data_size')
        assert response.status_code == 200
        assert response.json['size'] == "0 bytes"

def test_get_data_size_error(client):
    """
    Tests error handling when getting data size fails.
    """
    with patch('os.path.exists', side_effect=Exception("Test error")):
        response = client.get('/api/data_size')
        assert response.status_code == 500
        assert response.json['status'] == "error"
        assert "Test error" in response.json['message']
