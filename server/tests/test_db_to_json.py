"""
This has a test for db_to_json.py.
"""
import os
import sys
import json
import shutil
import pytest
from database_filler import fill_test_database

# path needs to be before db_to_json import, at least in local tests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from db_to_json import db_connect, transform_articles_to_json  # pylint: disable=import-error

@pytest.fixture(scope='module')
def setup_database():
    conn = db_connect.connect()
    fill_test_database(conn)
    yield conn
    conn.close()

# setup_database is passed as parameter, invoking it
def test_db_to_json(setup_database):
    os.makedirs('test-rss-fetcher/data', exist_ok=True)
    
    transform_articles_to_json()

    file_path = 'test-rss-fetcher/data/articles.json'
    assert os.path.exists(file_path), "The articles.json file was not created."

    with open(file_path, 'r', encoding='utf-8') as file:
        json_data = json.load(file)

    expected_data = [
        {
            'id': 1,
            'url': 'https://blabla.com/article1',
            'html': '&lt;!DOCTYPE html&gt;&lt;html lang=&quot;fi&quot;&gt;&lt;head&gt;',
            'full_text': 'Full text 1.',
            'time': '2016-06-06 09:09:09',
            'download_time': '2024-04-04 08:08:08.777777'
        },
        {
            'id': 2,
            'url': 'https://blabla.com/article2',
            'html': '&lt;p&gt;Html 2&lt;/p&gt;',
            'full_text': 'Full text 2.',
            'time': '2016-06-06 09:09:09',
            'download_time': '2024-04-04 08:08:08.777777'
        }
    ]
    assert json_data == expected_data, "The data in articles.json does not match the expected data."

    shutil.rmtree('test-rss-fetcher')
