"""
Tests query_processor.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results(client):
    response = client.get('/api/articles/search', query_string={'searchQuery': 'blabla'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_empty_query_having_fetched(client):
    response = client.get('/api/articles/search', query_string={'searchQuery': ''})
    assert response.status_code == 200
    assert isinstance(response.json, list)

# doesn't have db setup fixture so doesn't get articles
def test_get_search_results_empty_query_without_having_fetched(client):
    response = client.get('/api/articles/search', query_string={'searchQuery': ''})
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_get_search_results_db_error(client):
    with patch('data_analysis.query_processor.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/search')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when searching: Mock database error"
