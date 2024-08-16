# Read instructions carefully to understand:
# First we build the client, then we build the server
# We copy the client build to the server's 'static' folder to serve it

# First stage is here to build the client
FROM node:22.5.1-bookworm-slim AS build-stage

# Define build arguments for environment variables
ARG VITE_API_BASE_URL=" "
ARG VITE_RELEASE_VERSION

# Set environment variables during the build process
ENV VITE_WEBPAGE_URL=${VITE_API_BASE_URL}
ENV VITE_RELEASE_VERSION=${VITE_RELEASE_VERSION}

WORKDIR /app/client

# Copy package.json and package-lock.json to the container
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client files to the container
COPY client/ ./

# Build the client
RUN npm run build

# Second stage is here to build the server
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the built client directly to the server's static folder
COPY --from=build-stage /app/client/dist /app/server/static

# Copy backend files to container
COPY server /app/server

# Remove existing rss-fetcher if it exists, then create a new empty one
RUN rm -rf /app/server/rss-fetcher && mkdir -p /app/server/rss-fetcher

# Download and extract the original tool into rss-fetcher
ADD https://github.com/ayriainen/news-article-collection/archive/main.tar.gz /tmp/
RUN tar -xzf /tmp/main.tar.gz -C /app/server/rss-fetcher --strip-components=1 && \
    rm /tmp/main.tar.gz

# Create directory for data
RUN mkdir -p /app/server/rss-fetcher/data

# Solve Rahti cache issue by setting caches to a specific writable directory
ENV XDG_CACHE_HOME=/app/server/rss-fetcher/data/.cache

# Install dependencies of flask backend and rss-fetcher, but do not cache them
RUN pip install --no-cache-dir -r server/requirements.txt && \
    pip install --no-cache-dir -r server/rss-fetcher/requirements.txt

EXPOSE 5000

WORKDIR /app/server

CMD ["python3", "-m", "src.app"]
