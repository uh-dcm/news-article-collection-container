from newspaper import Article

import database

def download_and_parse( url ):

    article = Article( url )
    article.download()
    article.parse()

    new_article = database.articles.insert().values(
        url = url,
        html = article.html,
        full_text = article.text,
        time = article.publish_date
    )

    new_article = database.connection.execute( new_article )
    return new_article.lastrowid

def process_urls():

    urls_to_collect = database.urls.select().where( database.urls.c.download_attempted == False )
    urls_to_collect = database.connection.execute( urls_to_collect ).fetchall()

    for row in urls_to_collect:

        row = row._mapping

        stm = database.urls.update().where( database.urls.c.id == row['id'] ).values( download_attempted = True )
        database.connection.execute( stm )

        try:
            stored_id = download_and_parse( row['url'] )
            stm = database.urls.update().where( database.urls.c.id == row['id'] ).values( article_id = stored_id )
            database.connection.execute( stm )
        except:
            pass

        database.connection.commit()

if __name__ == '__main__':
    process_urls()
