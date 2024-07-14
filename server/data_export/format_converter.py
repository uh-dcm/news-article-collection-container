"""
This converts db to json, csv and parquet. Called by export_manager.py.
"""
import json
import csv

from config import FETCHER_FOLDER

def convert_db_to_format(df, file_format, base_filename):
    """
    Delegates the converting of the dataframe to
    convert_db_to_json, conver_db_to_csv and convert_db_to_parquet.
    Called by export_manager.convert_and_send().
    """
    if file_format == 'json':
        return convert_db_to_json(df, base_filename)
    elif file_format == 'csv':
        return convert_db_to_csv(df, base_filename)
    elif file_format == 'parquet':
        return convert_db_to_parquet(df, base_filename)
    else:
        raise ValueError("Unsupported format")

def convert_db_to_json(df, base_filename):
    """
    True convert of db to .json. Called by convert_db_to_format().
    Uses dump instead of regular Pandas export, as timestamps needed as strings
    and URL not to be escaped.
    """
    json_file_path = f'./{FETCHER_FOLDER}/data/{base_filename}.json'
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)
    return f'{base_filename}.json'

def convert_db_to_csv(df, base_filename):
    """
    True convert of db to .csv. Called by convert_db_to_format().
    Quotes everything but numeric, and uses backslash as escapechar.
    """
    csv_file_path = f'./{FETCHER_FOLDER}/data/{base_filename}.csv'
    df.to_csv(csv_file_path, index=False, quoting=csv.QUOTE_NONNUMERIC, escapechar='\\', encoding='utf-8')
    return f'{base_filename}.csv'

def convert_db_to_parquet(df, base_filename):
    """
    True convert of db to .parquet. Called by convert_db_to_format().
    Doesn't require any special settings. Pandas needed Pyarrow
    for this however.
    """
    parquet_file_path = f'./{FETCHER_FOLDER}/data/{base_filename}.parquet'
    df.to_parquet(parquet_file_path, index=False)
    return f'{base_filename}.parquet'
