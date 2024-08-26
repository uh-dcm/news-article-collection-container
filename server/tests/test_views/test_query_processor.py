"""
Tests query_processor.py route responses and functions.
"""
# Added new test cases:
# Test for Invalid Query Parameter: Ensure the system handles invalid query parameters gracefully.
# Test for Special Characters in Query: Verify the behavior when the search query contains special characters.
# Test for Large Query Result: Simulate a search query that returns a large number of results to check performance and response.

from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results(client):
    """
    Tests that querying with setup-inserted 'blabla' returns
    a jsonified list (not export) when articles exist. Uses db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'generalQuery': 'blabla'})
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
    assert isinstance(response.json['data'], list)
    assert 'total_count' in response.json
    assert 'page' in response.json
    assert 'per_page' in response.json

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_empty_query_having_fetched(client):
    """
    Tests that an empty query returns a jsonified list when articles exist.
    Uses db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'generalQuery': ''})
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
    assert isinstance(response.json['data'], list)
    assert 'total_count' in response.json
    assert 'page' in response.json
    assert 'per_page' in response.json

def test_get_search_results_empty_query_without_having_fetched(client):
    """
    Tests querying without articles having been fetched.
    Note that this doesn't have the db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'generalQuery': ''})
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."
    response = client.get('/api/articles/search', query_string={'searchQuery': ''})
    assert response.status_code == 404
    #assert response.json == {'message':'status':'error'}

def test_get_search_results_db_error(client):
    """
    Tests a db error when querying.
    """
    with patch('src.utils.resource_management.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")
        response = client.get('/api/articles/search')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when searching: Mock database error"

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_pagination(client):
    """
    Tests search result pagination.
    """
    response = client.get(
        '/api/articles/search',
        query_string={'generalQuery': '', 'page': 1, 'per_page': 1}
    )
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert len(response.json['data']) <= 1
    assert response.json['page'] == 1
    assert response.json['per_page'] == 1

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_sorting(client):
    """
    Tests search result sorting.
    """
    response = client.get(
        '/api/articles/search',
        query_string={'generalQuery': '', 'sort_by': 'time', 'sort_order': 'desc'}
    )
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
    if len(response.json['data']) > 1:
        assert response.json['data'][0]['time'] >= response.json['data'][1]['time']

        assert response.json('status','message') == {"status": "error", "message": "Database error when searching"}

# Ensure the system handles invalid query parameters gracefully.
@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_invalid_query_param(client):
    """
    Tests querying with an invalid query parameter.
    Uses db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'invalidParam': 'blabla'})
    assert response.status_code == 200
     
    # Ensure the response is a dictionary
    assert isinstance(response.json, dict)
    # Check the message in the response
    assert response.json ==  {'data': [], 'page': 1, 'per_page': 10, 'total_count': 0}

# Verify the behavior when the search query contains special characters.
@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_special_characters(client):
    """
    Tests querying with special characters in the search query.
    Uses db setup fixture.
    """
    response = client.get('/api/articles/search', query_string={'searchQuery': '!@#$%^&*()'})
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert response.json == {'data': [], 'page': 1, 'per_page': 10, 'total_count': 0}

# Simulate a search query that returns a large number of results to check performance 
# and response.
""" @pytest.mark.usefixtures("setup_and_teardown_for_large_dataset")
def test_get_search_results_large_query_result(client):
    
    # Tests querying that returns a large number of results.
    # Uses db setup fixture.
    
    response = client.get('/api/articles/search', query_string={'searchQuery': 'common_term'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) > 100  # Example check for large result set """