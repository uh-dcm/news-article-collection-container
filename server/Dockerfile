FROM python:3.12-slim-bookworm

WORKDIR /app/server

ARG CACHEBUST=1

COPY . .

# Make directory for data and add file
RUN mkdir -p rss-fetcher/data && touch rss-fetcher/data/feeds.txt

# Install dependencies of flask backend, but do not cache them
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV FLASK_ENV=development

ENV FLASK_DEBUG=1

CMD sh -c "python app.py --debug"
