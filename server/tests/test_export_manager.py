"""
Tests export_manager.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_json(client):
    response = client.get('/api/articles/export?format=json')
    assert response.status_code == 200
    assert response.content_type == 'application/json'

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_csv(client):
    response = client.get('/api/articles/export?format=csv')
    assert response.status_code == 200
    assert response.content_type == 'text/csv; charset=utf-8'

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_parquet(client):
    response = client.get('/api/articles/export?format=parquet')
    assert response.status_code == 200
    assert response.content_type == 'application/octet-stream'

def test_exporting_insensitive_format(client):
    response = client.get('/api/articles/export?format=JSON')
    assert response.status_code == 400
    assert response.content_type == 'application/json'
    assert response.json['message'] == "Invalid format requested."

def test_exporting_whitespace_format(client):
    response = client.get('/api/articles/export?format= csv ')
    assert response.status_code == 400
    assert response.content_type == 'application/json'
    assert response.json['message'] == "Invalid format requested."

def test_exporting_multiple_formats(client):
    response = client.get('/api/articles/export?format=json&format=csv')
    assert response.status_code == 400
    assert response.content_type == 'application/json'
    assert response.json['message'] == "Invalid format requested."

def test_exporting_no_format(client):
    response = client.get('/api/articles/export')
    assert response.status_code == 400
    assert response.json['message'] == "No format specified."

# doesn't have db setup fixture so doesn't get articles
def test_exporting_no_data(client):
    response = client.get('/api/articles/export?format=json')
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_exporting_db_error(client):
    with patch('data_export.export_manager.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/export?format=json')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when downloading: Mock database error"
