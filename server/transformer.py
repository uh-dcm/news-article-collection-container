"""
This transforms db to json, csv and parquet, called by download_articles.py.
"""
import os
import html
import json
import csv
import time
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URL, FETCHER_FOLDER

LOCK_FILE = f'./{FETCHER_FOLDER}/processing.lock'
db_connect = create_engine(DATABASE_URL)

# if escaping html isn't required, remove this and change expected test data
def escape_html_content(df):
    if 'html' in df.columns:
        df["html"] = df["html"].apply(html.escape)
    return df

def transform_db_to_csv(df):
    csv_file_path = f'./{FETCHER_FOLDER}/data/articles.csv'
    # pd by standard puts csv values in quotes, and this says no need for numeric
    df.to_csv(csv_file_path, index=False, quoting=csv.QUOTE_NONNUMERIC)

def transform_db_to_json(df):
    json_file_path = f'./{FETCHER_FOLDER}/data/articles.json'
    # dump used because timestamps needed as strings and url not to be escaped
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

def transform_db_to_parquet(df):
    parquet_file_path = f'./{FETCHER_FOLDER}/data/articles.parquet'

    # if timestamps aren't needed as strings, remove and change tests
    timestamp_columns = ['time', 'download_time']
    for column in timestamp_columns:
        if column in df.columns:
            df[column] = df[column].astype(str)

    df.to_parquet(parquet_file_path, index=False)

def transform_db_to_format(format):
    # wait for collect.py and process.py to finish
    # double verification in case of possible rare events
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    df = pd.read_sql_table('articles', con=db_connect)
    df = escape_html_content(df)
    
    if format == 'csv':
        transform_db_to_csv(df)
    elif format == 'json':
        transform_db_to_json(df)
    elif format == 'parquet':
        transform_db_to_parquet(df)
    else:
        raise ValueError("Unsupported format")
