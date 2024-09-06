"""
Tests export_manager.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy.exc import SQLAlchemyError
import pytest
from flask import Response

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_json(client):
    """
    Tests non-query json export, when articles exist.
    Uses the db setup fixture.
    """
    response = client.get('/api/articles/export?format=json')
    assert response.status_code == 200
    assert response.content_type == 'application/json'
    assert response.headers['Content-Disposition'] == 'attachment; filename="articles.json"'

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_csv(client):
    """
    Tests non-query csv export, when articles exist.
    Uses the db setup fixture.
    """
    response = client.get('/api/articles/export?format=csv')
    assert response.status_code == 200
    assert response.content_type == 'text/csv'
    assert response.headers['Content-Disposition'] == 'attachment; filename="articles.csv"'

@pytest.mark.usefixtures("setup_and_teardown")
def test_exporting_parquet(client):
    """
    Tests non-query parquet export, when articles exist.
    Uses the db setup fixture.
    """
    response = client.get('/api/articles/export?format=parquet')
    assert response.status_code == 200
    assert response.content_type == 'application/octet-stream'
    assert response.headers['Content-Disposition'] == 'attachment; filename="articles.parquet"'
    assert 'Content-Length' in response.headers

def test_exporting_no_data(client):
    """
    Tests exporting with no data. Note that it doesn't have
    the db setup fixture, so it doesn't find any articles.
    """
    with patch('src.views.data_export.export_manager.check_articles_table') as mock_check:
        mock_check.return_value = Response(
            response=(
                '{"status": "error", '
                '"message": "No articles found. Please fetch the articles first."}'
            ),
            status=404,
            mimetype='application/json'
        )
        response = client.get('/api/articles/export?format=json')
        assert response.status_code == 404
        assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_exporting_db_error(client):
    """Tests db error when exporting."""
    with patch(
        'src.views.data_export.export_manager.current_app.db_engine.connect'
    ) as mock_connect:
        mock_connect.side_effect = SQLAlchemyError("Mock database error")
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

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_query_export_json(client):
    """Test json query export without last searched ids."""
    response = client.get('/api/articles/export_query?format=json')
    assert response.status_code == 200
    assert response.content_type == 'application/json'
    assert response.headers['Content-Disposition'] == 'attachment; filename="articles_query.json"'

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_query_export_csv(client):
    """Test csv query export without last searched ids."""
    response = client.get('/api/articles/export_query?format=csv')
    assert response.status_code == 200
    assert response.content_type == 'text/csv'
    assert response.headers['Content-Disposition'] == 'attachment; filename="articles_query.csv"'

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_query_export_parquet(client):
    """Test parquet query export without last searched ids."""
    response = client.get('/api/articles/export_query?format=parquet')
    assert response.status_code == 200
    assert response.content_type == 'application/octet-stream'
    assert response.headers['Content-Disposition'] == (
        'attachment; filename="articles_query.parquet"'
    )
    assert 'Content-Length' in response.headers
