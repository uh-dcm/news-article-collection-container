"""
This converts db to json, csv and parquet. Called by export_manager.py.
"""
import os
import json
import csv
import time
import pandas as pd

from config import FETCHER_FOLDER

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def convert_db_to_format(engine, file_format):
    """
    Reads the table and delegates the converting to
    convert_db_to_json, conver_db_to_csv and convert_db_to_parquet.
    Called by export_manager.convert().
    """
    # just for extra safety, ensure waiting for processing here too
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    df = pd.read_sql_table('articles', con=engine)

    if file_format == 'json':
        convert_db_to_json(df)
    elif file_format == 'csv':
        convert_db_to_csv(df)
    elif file_format == 'parquet':
        convert_db_to_parquet(df)
    else:
        raise ValueError("Unsupported format")

def convert_db_to_json(df):
    """
    True convert of db to .json. Called by convert_db_to_format().
    Uses dump instead of regular Pandas export, as timestamps needed as strings
    and URL not to be escaped.
    """
    json_file_path = f'./{FETCHER_FOLDER}/data/articles.json'
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

def convert_db_to_csv(df):
    """
    True convert of db to .csv. Called by convert_db_to_format().
    Quotes everything but numeric, and uses backslash as escapechar.
    """
    csv_file_path = f'./{FETCHER_FOLDER}/data/articles.csv'
    df.to_csv(csv_file_path, index=False, quoting=csv.QUOTE_NONNUMERIC, escapechar='\\', encoding='utf-8')

def convert_db_to_parquet(df):
    """
    True convert of db to .parquet. Called by convert_db_to_format().
    Doesn't require any special settings.
    """
    parquet_file_path = f'./{FETCHER_FOLDER}/data/articles.parquet'
    df.to_parquet(parquet_file_path, index=False)
