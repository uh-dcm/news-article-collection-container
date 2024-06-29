"""
This transforms db to csv, called by download_articles.py.
"""
import os
import csv
import time
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URL, FETCHER_FOLDER

LOCK_FILE = f'./{FETCHER_FOLDER}/processing.lock'

db_connect = create_engine(DATABASE_URL)

def transform_articles_to_csv():
    # wait for collect.py and process.py to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    # Read database articles table to a pandas DataFrame
    df = pd.read_sql_table('articles', con=db_connect)

    csv_file_path = f'./{FETCHER_FOLDER}/data/articles.csv'

    df.to_csv(csv_file_path, index=False, quoting=csv.QUOTE_NONNUMERIC)

if __name__ == '__main__':
    transform_articles_to_csv()
