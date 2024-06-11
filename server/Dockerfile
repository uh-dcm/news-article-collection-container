FROM python:3.12-slim-bookworm

WORKDIR /app/server

COPY . .

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* \
    && rm -rf rss-fetcher && mkdir rss-fetcher && \
    git clone https://github.com/uh-dcm/news-article-collection rss-fetcher


# Install dependencies of flask backend, but do not cache them
RUN pip install --no-cache-dir -r requirements.txt

# Install dependencies of rss-fetcher, but do not cache them
RUN pip install --no-cache-dir -r rss-fetcher/requirements.txt

EXPOSE 5000

ENV FLASK_ENV=development

ENV FLASK_DEBUG=1

CMD sh -c "python app.py --debug"