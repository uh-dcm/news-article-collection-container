"""
This transforms db to parquet, called by download_articles.py.
"""
import os
import time
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URL, FETCHER_FOLDER

LOCK_FILE = f'./{FETCHER_FOLDER}/processing.lock'

db_connect = create_engine(DATABASE_URL)

def transform_articles_to_parquet():
    # wait for collect.py and process.py to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    # Read database articles table to a pandas DataFrame
    df = pd.read_sql_table('articles', con=db_connect)

    parquet_file_path = f'./{FETCHER_FOLDER}/data/articles.parquet'

    df.to_parquet(parquet_file_path, index=False)

if __name__ == '__main__':
    transform_articles_to_parquet()
