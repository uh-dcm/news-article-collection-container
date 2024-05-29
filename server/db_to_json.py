import html
import json
import pandas as pd
from sqlalchemy import create_engine

# ! Requires that the database is created with collected and processed data

# Read database articles table to a pandas DataFrame
db_connect = create_engine('sqlite:///./rss-fetcher/data.db')
df = pd.read_sql_table('articles', con=db_connect)

# Encode html-column data before writing
df["html"] = df["html"].apply(html.escape)

with open('articles.json', 'w', encoding='utf-8') as file:
    # format defaults to string, to enable DateTime parsing
    json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)




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
