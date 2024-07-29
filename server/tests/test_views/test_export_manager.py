"""
Tests export_manager.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_json(client):
    """
    Tests non-query json export, when articles exist.
    Uses the db setup fixture.
    """
    response = client.get('/api/articles/export?format=json')
    assert response.status_code == 200
    assert response.content_type == 'application/json'

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_csv(client):
    """
    Tests non-query csv export, when articles exist.
    Uses the db setup fixture.
    """
    response = client.get('/api/articles/export?format=csv')
    assert response.status_code == 200
    assert response.content_type == 'text/csv; charset=utf-8'

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_parquet(client):
    """
    Tests non-query parquet export, when articles exist.
    Uses the db setup fixture.
    """
    response = client.get('/api/articles/export?format=parquet')
    assert response.status_code == 200
    assert response.content_type == 'application/octet-stream'

def test_exporting_no_data(client):
    """
    Tests exporting with no data. Note that it doesn't have
    the db setup fixture, so it doesn't find any articles.
    """
    response = client.get('/api/articles/export?format=json')
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_exporting_db_error(client):
    """Tests db error when exporting."""
    with patch('src.utils.resource_management.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")
        response = client.get('/api/articles/export?format=json')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when downloading: Mock database error"

def test_exporting_insensitive_case_format(client):
    """Tests insensitive case format export."""
    response = client.get('/api/articles/export?format=JSON')
    assert response.status_code == 404

def test_exporting_whitespace_format(client):
    """Tests extra whitespace format export."""
    response = client.get('/api/articles/export?format= csv ')
    assert response.status_code == 404

def test_exporting_multiple_formats(client):
    """Tests unused multiple format export."""
    response = client.get('/api/articles/export?format=json&format=csv')
    assert response.status_code == 404

def test_exporting_no_format(client):
    """Tests no format export."""
    response = client.get('/api/articles/export')
    assert response.status_code == 404
