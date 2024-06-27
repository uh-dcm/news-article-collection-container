"""
This transforms db first to .json and then to .csv.
"""
import html
import json
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URL, FETCHER_FOLDER
#from io import StringIO

# Requires that the database is created with collected and processed data
db_connect = create_engine(DATABASE_URL)

def transform_articles_to_csv():
    # Read database articles table to a pandas DataFrame
    df = pd.read_sql_table('articles', con=db_connect)

    # Encode html-column data before saving
    df["html"] = df["html"].apply(html.escape)

    # df.to_dict(orient='records'): Converts the DataFrame to a list of dictionaries, 
    # where each dictionary represents a row in the DataFrame. The keys in the dictionaries 
    # correspond to db-table column names, and the values are the corresponding cell values.
    with open(f'./{FETCHER_FOLDER}/data/articles.json', 'w', encoding='utf-8') as file:
        #format DateTime-defaults to string, to enable DateTime parsing
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

    # convert .json to .csv and save articles.csv
    # At first read JSON data from a file 
    with open(f'./{FETCHER_FOLDER}/data/articles.json', 'r', encoding='utf-8') as file:
        df = pd.read_json(file)

        #OPTION: normalize json-dataframe (not used)
        #Writing Normalized Data to a CSV File:
        #The normalized DataFrame, df, is written to the CSV file using df.to_csv(file, index=False, encoding='utf-8').
        #The index=False argument ensures that row indices are not included in the CSV output.
        #The resulting CSV file will be named articles.csv and 
        #will contain the flattened data from the original JSON.
        #df = pd.json_normalize(df)
    
    # save df as articles.csv
    with open(f'./{FETCHER_FOLDER}/data/articles.csv', 'w', encoding='utf-8') as file:
        df.to_csv(file, sep='\t', index=False)

if __name__ == '__main__':
    transform_articles_to_csv()
