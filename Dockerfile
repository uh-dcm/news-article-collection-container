# Read instructions carefully to understand:
# First we build the client, then we build the server
# We copy the client build to the server's 'static' folder to serve it

# First stage is here to build the client
FROM node:22-bookworm-slim AS build-stage

# Define build arguments for environment variables
ARG VITE_API_BASE_URL=" "

# Set environment variables during the build process
ENV VITE_WEBPAGE_URL=${VITE_API_BASE_URL}

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
FROM python:3.12-slim-bookworm

# Copy stuff from the first stage (client) to the second stage (server)
COPY --from=build-stage /app/client/dist /app/client/build

WORKDIR /app

# Copy backend files to container
COPY server server

# Copy frontend build to static folder
RUN cp -r client/build server/static

# Create directory for data
RUN mkdir server/rss-fetcher/data

# Install dependencies of flask backend, but do not cache them
RUN pip install --no-cache-dir -r server/requirements.txt

EXPOSE 5000

WORKDIR /app/server

CMD ["python3", "-m", "app"]