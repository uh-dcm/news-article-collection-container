
from sqlalchemy import text

def fill_test_database(conn):
    # Create the articles table with necessary constraints
    # Table Structure: Added AUTOINCREMENT to the id column and NOT NULL constraint to the url column.
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            html TEXT,
            full_text TEXT,
            time DATETIME,
            download_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))

    # Insert test data into the articles table
    # Added more entries to the articles table to cover scenarios.
    conn.execute(text("""
        INSERT INTO articles (url, html, full_text, time, download_time) VALUES
        ('https://blabla.com/article1', '<!DOCTYPE html><html lang="fi"><head>', 'Full text 1.', '2016-06-06 09:09:09', '2024-04-04 08:08:08.777777'),
        ('https://blabla.com/article2', '<p>Html 2</p>', 'Full text 2.', '2016-06-06 09:09:09', '2024-04-04 08:08:08.777777'),
        ('https://blabla.com/article3', '<p>Html 3</p>', 'Full text 3.', '2017-07-07 10:10:10', '2024-05-05 09:09:09.888888'),
        ('https://blabla.com/article4', '<p>Html 4</p>', 'Full text 4.', '2018-08-08 11:11:11', '2024-06-06 10:10:10.999999'),
        ('https://blabla.com/article5', '<p>Html 5</p>', 'Full text 5.', '2019-09-09 12:12:12', '2024-07-07 11:11:11.000000')
    """))

# verify database operations
# Added a test case to verify the existence of the table, the number of rows, and the content of a specific row.
def test_database_operations(engine):
    with engine.connect() as conn:
        # Verify the articles table exists, define db-name here:
        # result = conn.execute(text("SELECT name FROM postgresql WHERE type='table' AND name='articles'"))
        # assert result.fetchone() is not None

        # Verify the number of rows in the articles table
        result = conn.execute(text("SELECT COUNT(*) FROM articles"))
        count = result.fetchone()[0]
        assert count == 5

        # Verify the content of a specific row
        result = conn.execute(text("SELECT * FROM articles WHERE url='https://blabla.com/article1'"))
        article = result.fetchone()
        assert article is not None
        assert article['full_text'] == 'Full text 1.'