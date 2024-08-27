"""
Tests stats_analyzer.py route responses and functions.
"""
# Added new test cases:
# Test for Empty Statistics: Ensure the system handles cases where the statistics result is empty.
# Test for Invalid Query Parameter: Verify the behavior when an invalid query parameter is provided.

from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results(client):
    """
    Tests that a stats call returns a jsonified list when the
    articles table exists. Uses db setup fixture.
    """
    response = client.get('/api/articles/statistics')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_stats_no_articles(client):
    """
    Tests getting stats without articles having been fetched.
    Note that this doesn't have the db setup fixture.
    """
    response = client.get('/api/articles/statistics')
    assert response.status_code == 404
    assert response.json == {
            'status': 'error',
            'message': 'No articles found. Please fetch the articles first.'}

def test_get_stats_db_error(client):
    """Tests db error when getting stats."""
    with patch('src.utils.resource_management.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/statistics')
        assert response.status_code == 500
        assert response.json == {
            'status': 'error',
            'message': 'Database error when getting statistics: Mock database error'
        }

# Ensure the system handles cases where the statistics result is empty.
@pytest.mark.usefixtures("setup_and_teardown")
def test_get_stats_empty_result(client):
    """Tests getting stats when the result is empty."""
    with patch('src.views.data_analysis.stats_analyzer.get_stats', return_value=''):
        response = client.get('/api/articles/statistics')
        assert response.status_code == 200
        assert response.json == [[], [], []]

# Verify the behavior when an invalid query parameter is provided.
@pytest.mark.usefixtures("setup_and_teardown")
def test_get_stats_invalid_query_param(client):
    """Tests getting stats with an invalid query parameter."""
    response = client.get('/api/articles/statistics', query_string={'invalidParam': 'value'})
    assert response.status_code == 200
    assert response.json == [[], [], []]