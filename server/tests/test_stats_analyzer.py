"""
Tests stats_analyzer.py route responses and functions.
"""
from unittest.mock import patch
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import pytest

from app import engine

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_search_results(client):
    response = client.get('/api/articles/statistics')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_stats_no_articles(client):
    conn = engine.connect()
    conn.execute(text("DROP TABLE IF EXISTS articles"))
    conn.close()

    response = client.get('/api/articles/statistics')
    assert response.status_code == 404
    assert response.json['message'] == "No articles found. Please fetch the articles first."

def test_get_stats_db_error(client):
    with patch('data_analysis.stats_analyzer.inspect') as mock_inspect:
        mock_inspect.side_effect = SQLAlchemyError("Mock database error")

        response = client.get('/api/articles/statistics')
        assert response.status_code == 500
        assert response.json['message'] == "Database error when getting statistics: Mock database error"
