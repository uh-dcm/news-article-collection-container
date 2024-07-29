FROM python:3.12-slim-bookworm

WORKDIR /app/server

ARG CACHEBUST=1

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* \
    && rm -rf rss-fetcher && mkdir rss-fetcher && \
    git clone https://github.com/ayriainen/news-article-collection rss-fetcher

COPY . .

# Make directory for data and add file
RUN mkdir -p rss-fetcher/data && touch rss-fetcher/data/feeds.txt

# Install dependencies of flask backend, but do not cache them
RUN pip install --no-cache-dir -r requirements.txt

# Install dependencies of rss-fetcher, but do not cache them
RUN pip install --no-cache-dir -r rss-fetcher/requirements.txt

EXPOSE 5000

ENV FLASK_ENV=development

ENV FLASK_DEBUG=1

CMD sh -c "python src/app.py --debug"
