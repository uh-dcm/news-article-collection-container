# Read instructions carefully to understand:
# First we build the client, then we build the server
# We copy the client build to the server's 'static' folder to serve it

# First stage is here to build the client
FROM node:18.1.0-buster-slim as build-stage

WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY client/package*.json ./client/

# Install dependencies
RUN cd client && npm install

# Copy the rest of the client files to the container
# We do not copy the whole client folder because 
COPY client/ ./client/
RUN cd client && npm run build

# Second stage is here to build the server
FROM python:3.9.10-slim-buster

# Copy stuff from the first stage (client) to the second stage (server)
COPY --from=build-stage /app/client/dist /app/client/build

WORKDIR /app

USER root

# Copy backend files to container
COPY server server

# Clone another repository into a subdirectory of /server
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* \
    && rm -rf server/rss-fetcher && mkdir server/rss-fetcher && \
    git clone -b bugfix/imports https://github.com/mpjk/news-article-collection server/rss-fetcher

# Copy frontend build to static folder
RUN cp -r client/build server/static

# Install dependencies of flask backend, but do not cache them
RUN pip install --no-cache-dir -r server/requirements.txt

# Install dependencies of rss-fetcher, but do not cache them
RUN pip install --no-cache-dir -r server/rss-fetcher/requirements.txt

EXPOSE 5000

# Hang (?) so that the container doesn't exit immediately
CMD ["bash"]