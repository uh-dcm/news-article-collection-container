import datetime
from pathlib import Path

from sqlalchemy import *

BASE_DIR = Path(__file__).resolve().parent
database_path = BASE_DIR / 'data' / 'data.db'
DATABASE_URL = f"sqlite:///{database_path}"

engine = create_engine(DATABASE_URL, echo=False)
meta = MetaData()
connection = engine.connect()

urls = Table('urls', meta,
    Column("id", Integer, primary_key = True ),
    Column("feed", String),
    Column("url", String),
    Column('storage_time', DateTime, default=datetime.datetime.utcnow ),
    Column("download_attempted", Boolean, default = False ),
    Column("article_id", ForeignKey("articles.id"), default = None )
)

articles = Table( 'articles', meta,
    Column('id', Integer, primary_key = True),
    Column('url', String),
    Column('html', String),
    Column('full_text', String),
    Column('time', DateTime),
    Column('download_time', DateTime, default=datetime.datetime.utcnow )
)

meta.create_all(engine)
