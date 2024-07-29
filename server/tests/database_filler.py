"""
This is filler for test databases.
"""
from sqlalchemy import text

def fill_test_database(conn):
    """Fills test database with mock data."""
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY,
            url TEXT,
            html TEXT,
            full_text TEXT,
            time DATETIME,
            download_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))
    conn.execute(text("""
        INSERT INTO articles (url, html, full_text, time, download_time) VALUES
        ('https://blabla.com/article1', '<!DOCTYPE html><html lang="fi"><head>', 'Full text 1.', '2016-06-06 09:09:09', '2024-04-04 08:08:08.777777'),
        ('https://blabla.com/article2', '<p>Html 2</p>', 'Full text 2.', '2016-06-06 09:09:09', '2024-04-04 08:08:08.777777')
    """))
