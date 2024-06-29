"""
This has a test for db_to_parquet.py.
"""
import os
import sys
import shutil
import pandas as pd
import pytest
from database_filler import fill_test_database

# path needs to be before db_to_parquet import, at least in local tests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from downloader.db_to_parquet import db_connect, transform_articles_to_parquet  # pylint: disable=import-error

@pytest.fixture(scope='module')
def setup_database():
    conn = db_connect.connect()
    fill_test_database(conn)
    yield conn
    conn.close()

# setup_database is passed as parameter, invoking it
def test_db_to_parquet(setup_database):
    os.makedirs('test-rss-fetcher/data', exist_ok=True)

    transform_articles_to_parquet()

    file_path = 'test-rss-fetcher/data/articles.parquet'
    assert os.path.exists(file_path), "The articles.parquet file was not created."

    df = pd.read_parquet(file_path)
    parquet_data = df.to_dict(orient='records')

    # parquet needed the timestamps as strings
    for record in parquet_data:
        record['time'] = record['time'].strftime('%Y-%m-%d %H:%M:%S')
        record['download_time'] = record['download_time'].strftime('%Y-%m-%d %H:%M:%S.%f')

    expected_data = [
        {
            'id': 1,
            'url': 'https://blabla.com/article1',
            'html': '<!DOCTYPE html><html lang="fi"><head>',
            'full_text': 'Full text 1.',
            'time': '2016-06-06 09:09:09',
            'download_time': '2024-04-04 08:08:08.777777'
        },
        {
            'id': 2,
            'url': 'https://blabla.com/article2',
            'html': '<p>Html 2</p>',
            'full_text': 'Full text 2.',
            'time': '2016-06-06 09:09:09',
            'download_time': '2024-04-04 08:08:08.777777'
        }
    ]
    assert parquet_data == expected_data, "The data in articles.parquet does not match the expected data."

    shutil.rmtree('test-rss-fetcher')
