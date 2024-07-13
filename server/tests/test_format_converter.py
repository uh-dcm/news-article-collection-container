"""
Tests feed_manager.py functions.
"""
import os
import json
import csv
from copy import deepcopy
import pytest
import pandas as pd

from data_export.format_converter import convert_db_to_format

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

def verify_csv_data(file_path, expected_csv_data):
    expected_csv_data_copy = deepcopy(expected_csv_data)
    for item in expected_csv_data_copy:
        item['id'] = str(item['id'])
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        csv_data = list(reader)
    assert csv_data == expected_csv_data_copy, f"The data in articles.csv does not match the expected data. Expected: {expected_csv_data_copy}, Actual: {csv_data}"

def verify_json_data(file_path, expected_json_data):
    with open(file_path, 'r', encoding='utf-8') as file:
        json_data = json.load(file)
    assert json_data == expected_json_data, f"The data in articles.json does not match the expected data. Expected: {expected_json_data}, Actual: {json_data}"

def verify_parquet_data(file_path, expected_parquet_data):
    df = pd.read_parquet(file_path)
    parquet_data = df.to_dict(orient='records')
    expected_parquet_data_copy = deepcopy(expected_parquet_data)
    for item in expected_parquet_data_copy:
        item['time'] = str(item['time'])
        item['download_time'] = str(item['download_time'])
    assert parquet_data == expected_parquet_data_copy, f"The data in articles.parquet does not match the expected data. Expected: {expected_parquet_data_copy}, Actual: {parquet_data}"

@pytest.mark.usefixtures("setup_and_teardown")
def test_convert_db_to_csv():
    df = pd.DataFrame(expected_data)
    convert_db_to_format(df, 'csv', 'articles')
    file_path = 'test-rss-fetcher/data/articles.csv'
    assert os.path.exists(file_path), "The articles.csv file was not created."
    verify_csv_data(file_path, expected_data)

@pytest.mark.usefixtures("setup_and_teardown")
def test_convert_db_to_json():
    df = pd.DataFrame(expected_data)
    convert_db_to_format(df, 'json', 'articles')
    file_path = 'test-rss-fetcher/data/articles.json'
    assert os.path.exists(file_path), "The articles.json file was not created."
    verify_json_data(file_path, expected_data)

@pytest.mark.usefixtures("setup_and_teardown")
def test_convert_db_to_parquet():
    df = pd.DataFrame(expected_data)
    convert_db_to_format(df, 'parquet', 'articles')
    file_path = 'test-rss-fetcher/data/articles.parquet'
    assert os.path.exists(file_path), "The articles.parquet file was not created."
    verify_parquet_data(file_path, expected_data)

@pytest.mark.usefixtures("setup_and_teardown")
def test_convert_db_to_invalid_format():
    df = pd.DataFrame(expected_data)
    with pytest.raises(ValueError):
        convert_db_to_format(df, 'invalid_format', 'articles')
