import html
import json
import pandas as pd
from sqlalchemy import create_engine

# ! Requires that the database is created with collected and processed data

# Read database articles table to a pandas DataFrame
db_connect = create_engine('sqlite:///./rss-fetcher/data/data.db')
df = pd.read_sql_table('articles', con=db_connect)

# Encode html-column data before writing
df["html"] = df["html"].apply(html.escape)
'./rss-fetcher/data/articles.json'
with open('./rss-fetcher/data/articles.json', 'w', encoding='utf-8') as file:
    # format defaults to string, to enable DateTime parsing
    json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

# convert .json to .csv and save file.csv
    df = json.loads(articles.json)
    # normalize json-dataframe
    dfnorm = pd.json_normalize(df)
    # save as articles.csv
with open('./rss-fetcher/data/articles.csv', 'w', encoding='utf-8') as file:
    dfnorm.to_csv(file, index=False, encoding='utf-8')

