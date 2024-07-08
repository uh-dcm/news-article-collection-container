"""
Tests export_manager.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app import engine

def test_exporting_json(client):
    response = client.get('/api/articles/export?format=json')
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert response.content_type == 'application/json'

def test_exporting_csv(client):
    response = client.get('/api/articles/export?format=csv')
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert response.content_type.startswith('text/csv')

def test_exporting_parquet(client):
    response = client.get('/api/articles/export?format=parquet')
    assert response.status_code in [200, 404]
    if response.status_code == 200:
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

def test_exporting_no_data(client):
    conn = engine.connect()
    conn.execute(text("DROP TABLE IF EXISTS articles"))
    conn.close()

    response = client.get('/api/articles/export?format=json')
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_exporting_db_error(client):
    with patch('data_export.export_manager.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/export?format=json')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when downloading: Mock database error"
