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

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_with_text_query(client):
    """
    Tests searching with a specific text query.
    """
    response = client.get('/api/articles/search', query_string={'textQuery': 'Full text'})
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
    assert all('Full text' in item['full_text'] for item in response.json['data'])

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_with_url_query(client):
    """
    Tests searching with a specific URL query.
    """
    response = client.get('/api/articles/search', query_string={'urlQuery': 'blabla.com'})
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
    assert all('blabla.com' in item['url'] for item in response.json['data'])

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_with_time_range(client):
    """
    Tests searching within a specific time range.
    """
    response = client.get('/api/articles/search', query_string={
        'startTime': '2016-01-01',
        'endTime': '2016-12-31'
    })
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
    assert all('2016' in item['time'] for item in response.json['data'])

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_with_advanced_query(client):
    """
    Tests searching with an advanced query using AND, OR, NOT operators.
    """
    response = client.get('/api/articles/search', query_string={
        'textQuery': 'Full text AND (1 OR 2) NOT 3'
    })
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results_with_escaped_characters(client):
    """
    Tests searching with escaped characters in the query.
    """
    response = client.get('/api/articles/search', query_string={
        'textQuery': 'ESC%Full ESC_text'
    })
    assert response.status_code == 200
    assert isinstance(response.json, dict)
    assert 'data' in response.json
