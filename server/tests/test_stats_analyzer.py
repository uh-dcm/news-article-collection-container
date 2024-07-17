"""
Tests stats_analyzer.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results(client):
    response = client.get('/api/articles/statistics')
    assert response.status_code == 200
    assert isinstance(response.json, list)

# doesn't have db setup fixture so doesn't get articles
def test_get_stats_no_articles(client):
    response = client.get('/api/articles/statistics')
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_get_stats_db_error(client):
    with patch('data_analysis.stats_analyzer.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/statistics')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when getting statistics: Mock database error"
