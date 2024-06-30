"""
This has tests for the transformations of db_to_format_transformer.py.
"""
import os
import sys
import json
import csv
import shutil
import pytest
import pandas as pd
from copy import deepcopy
from database_filler import fill_test_database

# path needs to be before db_to_format_transformer import, at least in local tests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from transformer import db_connect, transform_db_to_format  # pylint: disable=import-error

@pytest.fixture(scope='module')
def setup_database():
    conn = db_connect.connect()
    fill_test_database(conn)
    yield conn
    conn.close()

@pytest.fixture(scope='function')
def setup_and_teardown():
    os.makedirs('test-rss-fetcher/data', exist_ok=True)
    yield
    shutil.rmtree('test-rss-fetcher')

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

def verify_csv_data(file_path, expected_data):
    # csv has the id as string, not int, so expected_data needs conversion
    expected_csv_data = deepcopy(expected_data)
    for item in expected_csv_data:
        item['id'] = str(item['id'])

    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        csv_data = list(reader)
    assert csv_data == expected_csv_data, f"The data in articles.csv does not match the expected data. Expected: {expected_csv_data}, Actual: {csv_data}"

def verify_json_data(file_path, expected_data):
    with open(file_path, 'r', encoding='utf-8') as file:
        json_data = json.load(file)
    assert json_data == expected_data, f"The data in articles.json does not match the expected data. Expected: {expected_data}, Actual: {json_data}"

def verify_parquet_data(file_path, expected_data):
    df = pd.read_parquet(file_path)
    parquet_data = df.to_dict(orient='records')
    assert parquet_data == expected_data, f"The data in articles.parquet does not match the expected data. Expected: {expected_data}, Actual: {parquet_data}"

def test_transform_articles_to_csv(setup_database, setup_and_teardown):
    transform_db_to_format('csv')
    file_path = 'test-rss-fetcher/data/articles.csv'
    assert os.path.exists(file_path), "The articles.csv file was not created."
    verify_csv_data(file_path, expected_data)

def test_transform_articles_to_json(setup_database, setup_and_teardown):
    transform_db_to_format('json')
    file_path = 'test-rss-fetcher/data/articles.json'
    assert os.path.exists(file_path), "The articles.json file was not created."
    verify_json_data(file_path, expected_data)

def test_transform_articles_to_parquet(setup_database, setup_and_teardown):
    transform_db_to_format('parquet')
    file_path = 'test-rss-fetcher/data/articles.parquet'
    assert os.path.exists(file_path), "The articles.parquet file was not created."
    verify_parquet_data(file_path, expected_data)
