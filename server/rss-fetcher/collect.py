import requests
import feedparser
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode

import database

def clean_url( url ):
    parsed = urlparse(url)
    qd = parse_qs(parsed.query, keep_blank_values=True)
    filtered = dict( (k, v) for k, v in qd.items() if not k.startswith('utm_'))
    newurl = urlunparse([
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        urlencode(filtered, doseq=True), # query string
        parsed.fragment
    ])
    return newurl

for feed_url in open("data/feeds.txt"):

    feed_url = feed_url.strip()
    feed = feedparser.parse( feed_url )

    for item in feed['items']:
        link = item['link']

        res = requests.get( link, allow_redirects = False )

        ## some services contain a redirection
        if 300 <= res.status_code < 400: ## detect redirections
            link = res.headers['location']

        link = clean_url( link )

        ## check if we already have this URL
        has_url = database.urls.select().where( database.urls.c.url == link )
        has_url = database.connection.execute( has_url )

        if not has_url.fetchone(): ## have not collected item yet

            new_url = database.urls.insert().values(
                feed = feed_url,
                url = link
            )

            print( link )

            database.connection.execute( new_url )

    database.connection.commit()
