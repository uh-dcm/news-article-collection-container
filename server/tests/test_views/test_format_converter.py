"""
Tests format_converter.py functions.
"""
import os
import json
import csv
import pyarrow.parquet as pq
import pytest
from src.views.data_export.format_converter import (
    convert_db_to_json,
    convert_db_to_csv,
    convert_db_to_parquet
)

class MockRow:
    """
    Mock data rows.
    """
    def __init__(self, data):
        self.__dict__.update(data)

    def _asdict(self):
        return self.__dict__

    def __iter__(self):
        return iter(self.__dict__.values())

class MockResult:
    """
    Mock result, as in data to be sent.
    """
    def __init__(self, data):
        self.data = [MockRow(row) for row in data]

    def __iter__(self):
        return iter(self.data)

    def keys(self):
        return self.data[0].__dict__.keys() if self.data else []

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

def test_convert_db_to_json():
    """
    Tests conversion of db articles to export JSON, when articles exist.
    Uses db setup fixture.
    """
    result = MockResult(expected_data)
    json_data = ''.join(list(convert_db_to_json(result)))
    assert json.loads(json_data) == expected_data

def test_convert_db_to_csv():
    """
    Tests conversion of db articles to export CSV, when articles exist.
    Uses db setup fixture.
    """
    result = MockResult(expected_data)
    csv_data = ''.join(list(convert_db_to_csv(result)))
    csv_reader = csv.DictReader(csv_data.splitlines())
    assert list(csv_reader) == [
        {k: str(v) for k, v in row.items()}
        for row in expected_data
    ]

@pytest.mark.usefixtures("setup_and_teardown")
def test_convert_db_to_parquet(app_config):
    """
    Tests conversion of db articles to export Parquet, when articles exist.
    Uses db setup fixture.
    """
    result = MockResult(expected_data)
    output_file_path = os.path.join(app_config['FETCHER_FOLDER'], 'data', 'test.parquet')
    convert_db_to_parquet(result, output_file_path)
    assert os.path.exists(output_file_path)
    table = pq.read_table(output_file_path)
    parquet_data = []
    for batch in table.to_batches():
        for row in batch.to_pylist():
            row['id'] = int(row['id'])
            parquet_data.append(row)

    assert parquet_data == expected_data

def test_convert_db_to_json_empty():
    """Tests conversion of empty db to JSON."""
    result = MockResult([])
    json_data = ''.join(list(convert_db_to_json(result)))
    assert json.loads(json_data) == []

def test_convert_db_to_csv_empty():
    """Tests conversion of empty db to CSV."""
    result = MockResult([])
    csv_data = ''.join(list(convert_db_to_csv(result)))
    assert csv_data.strip() == ''

@pytest.mark.usefixtures("setup_and_teardown")
def test_convert_db_to_parquet_empty(app_config):
    """Tests conversion of empty db to Parquet."""
    result = MockResult([])
    output_file_path = os.path.join(app_config['FETCHER_FOLDER'], 'data', 'test_empty.parquet')
    convert_db_to_parquet(result, output_file_path)
    assert os.path.exists(output_file_path)
    table = pq.read_table(output_file_path)
    assert table.num_rows == 0
