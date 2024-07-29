"""
Tests query_processor.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results(client):
    """
    Tests that querying with setup-inserted 'blabla' returns
    a jsonified list (not export) when articles exist. Uses db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'searchQuery': 'blabla'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_empty_query_having_fetched(client):
    """
    Tests that an empty query returns a jsonified list when articles exist.
    Uses db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'searchQuery': ''})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_search_results_empty_query_without_having_fetched(client):
    """
    Tests querying without articles having been fetched.
    Note that this doesn't have the db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'searchQuery': ''})
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_get_search_results_db_error(client):
    """
    Tests a db error when querying.
    """
    with patch('src.utils.resource_management.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/search')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when searching: Mock database error"
