"""
This exports db to json, csv and parquet, called by download.py.
"""
import os
import json
import csv
import time
import pandas as pd
from config import FETCHER_FOLDER

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def export_db_to_csv(df):
    csv_file_path = f'./{FETCHER_FOLDER}/data/articles.csv'
    # backslash as escapechar, and quote everything but numeric
    df.to_csv(csv_file_path, index=False, quoting=csv.QUOTE_NONNUMERIC, escapechar='\\', encoding='utf-8')

def export_db_to_json(df):
    json_file_path = f'./{FETCHER_FOLDER}/data/articles.json'
    # dump used because timestamps needed as strings and url not to be escaped
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

def export_db_to_parquet(df):
    parquet_file_path = f'./{FETCHER_FOLDER}/data/articles.parquet'
    df.to_parquet(parquet_file_path, index=False)

def export_db_to_format(engine, format):
    # wait for collect.py and process.py to finish
    # double verification in case of possible rare events
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    df = pd.read_sql_table('articles', con=engine)

    if format == 'csv':
        export_db_to_csv(df)
    elif format == 'json':
        export_db_to_json(df)
    elif format == 'parquet':
        export_db_to_parquet(df)
    else:
        raise ValueError("Unsupported format")


def export_searched_articles_to_format(engine, format):
    # wait for collect.py and process.py to finish
    # double verification in case of possible rare events
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    json_file_path = f'./{FETCHER_FOLDER}/data/searchedarticles.json'
    with open(json_file_path, 'r') as file:
        df = pd.read_table(file)

    if format == 'csv':
        export_search_to_csv(df)
    elif format == 'json':
        export_search_to_json(df)
    elif format == 'parquet':
        export_search_to_parquet(df)
    else:
        raise ValueError("Unsupported format")

def export_search_to_csv(df):
    csv_file_path = f'./{FETCHER_FOLDER}/data/searchedarticles.csv'
    # backslash as escapechar, and quote everything but numeric
    df.to_csv(csv_file_path, index=False, quoting=csv.QUOTE_NONNUMERIC, escapechar='\\', encoding='utf-8')

def export_search_to_json(df):
    json_file_path = f'./{FETCHER_FOLDER}/data/searchedarticles.json'
    # dump used because timestamps needed as strings and url not to be escaped
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

def export_search_to_parquet(df):
    parquet_file_path = f'./{FETCHER_FOLDER}/data/searchedarticles.parquet'
    df.to_parquet(parquet_file_path, index=False)