"""
This transforms db to json.
"""
import os
import html
import json
import time
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URL, FETCHER_FOLDER

# ! Requires that the database is created with collected and processed data

LOCK_FILE = f'./{FETCHER_FOLDER}/processing.lock'

db_connect = create_engine(DATABASE_URL)

def transform_articles_to_json():

    # wait for collect.py and process.py to finish
    while os.path.exists(LOCK_FILE):
        time.sleep(1)

    # Read database articles table to a pandas DataFrame
    df = pd.read_sql_table('articles', con=db_connect)

    # Encode html-column data before writing
    df["html"] = df["html"].apply(html.escape)

    #df.to_dict(orient='records'): Converts the DataFrame to a list of dictionaries, where each dictionary represents a row in the DataFrame. The keys in the dictionaries 
    #correspond to column names, and the values are the corresponding cell values.
    with open(f'./{FETCHER_FOLDER}/data/articles.json', 'w', encoding='utf-8') as file:
        # The content of the file will be a list of dictionaries, where each dictionary 
        # represents a row from the “articles” table. Each dictionary 
        # contains key-value pairs corresponding to the column names 
        # and their respective values.
        # Format also defaults to string, to enable DateTime parsing
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

if __name__ == '__main__':
    transform_articles_to_json()

# Test for decoding encoded data in the articles.json
# Reads the last encoded article, and decodes it to test.html
# ------------------------------------------
# with open('articles.json', 'r') as file:
#     data = json.load(file)

# for i in data:
#     raw_html = i["html"]

# decoded_html = html.unescape(raw_html)

# with open("test.html", "w") as file:
#     file.write(decoded_html)
# ------------------------------------------
