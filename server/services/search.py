"""
This searches db for specific queries, called by app.py.
"""
import os
import time
import pandas as pd
from flask import jsonify, request
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError
from config import FETCHER_FOLDER
from log_config import logger

LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

def search_articles(engine):
    try:
        # check whether the table exists
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 404

        search_query = request.args.get('searchQuery', '')
        # Datetime object used instead of string to achieve proper sorting in table
        stmt = text("""
            SELECT DATETIME(time) as time, url, full_text 
            FROM articles 
            WHERE full_text LIKE :word 
            COLLATE utf8_general_ci
            ORDER BY time DESC
        """)
        stmt = stmt.bindparams(word=f'%{search_query}%')
        result = engine.connect().execute(stmt)
        rows = result.fetchall()
        
        data = [{"time": time, "url": url, "full_text": full_text} for time, url, full_text in rows]
        df = pd.read_table(data)
        #df = pd.read_table(rows) # alternative method to save search

        # save data temporarily to articles.json for a possible download 
        json_file_path = f'./{FETCHER_FOLDER}/data/searchedarticles.json'
        # dump used because timestamps needed as strings and url not to be escaped
        with open(json_file_path, 'w', encoding='utf-8') as file:
            json.dump(df.to_dict(orient='records'), file, indent=4, ensure_ascii=False, default=str)

        return jsonify(data), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error when searching: {e}")
        return jsonify({"status": "error", "message": f"Database error when searching: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Error when searching articles: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

def get_stats(engine):    
    try:
        inspector = inspect(engine)
        if not inspector.has_table('articles'):
            return jsonify({"status": "error", "message": "No articles found. Please fetch the articles first."}), 400

        # Queries URLs of the form www.url.com
        domain_query = text("""
                            SELECT 
                                SUBSTRING( REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/")- 1) as domain,
                                COUNT(*) as count
                            FROM articles 
                            GROUP BY domain
                            """)
        result = engine.connect().execute(domain_query)
        domain_rows = result.fetchall()

        # Queries URLs of the form www.url.com/subdirectory/
        subdir_query = text("""
                            SELECT
                                SUBSTRING(
                                    REPLACE( REPLACE( URL, 'https://', ''), 'http://', '') ,
                                    1,  
                                    LENGTH(SUBSTRING( REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), 1, INSTR(REPLACE(REPLACE(URL, 'https://', ''), 'http://', ''), "/")- 1))  
                                    + INSTR(SUBSTRING(REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), INSTR(REPLACE( REPLACE( URL, 'https://', ''), 'http://', ''), '/') + 1), '/') +1
                                    ) as domain,
                            COUNT (*) as count
                            FROM articles
                            GROUP BY domain
                                """)
        result = engine.connect().execute(subdir_query)
        subdir_rows = result.fetchall()

        # Queries dates and counts for articles
        dates_query = text("""
                            SELECT time, COUNT(*) as count
                            FROM articles
                            GROUP BY strftime('%d-%m-%Y', time)
                            ORDER BY time ASC;
                            """)
        result = engine.connect().execute(dates_query)
        dates_row = result.fetchall()

        dates = [{"name": time, "count": count} for time, count in dates_row]
        domain_data = [{"name": domain, "count": count} for domain, count in domain_rows]
        subdir_data = [{"name": domain, "count": count} for domain, count in subdir_rows]
        return jsonify(domain_data, subdir_data, dates), 200
    except Exception as e:
        print("Error: ", e)
        return jsonify({"status": "error", "message": str(e)}), 500