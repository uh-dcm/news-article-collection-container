# News Article Collection Container

[![GHA workflow Badge](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/main.yml/badge.svg)](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/main.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://www.helsinki.fi/en/center-information-technology/about-it-center/open-source-code-principles) [![CSC](https://img.shields.io/badge/CSC-white?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAMAAAANxBKoAAAAe1BMVEVHcExZLWCDAFGDAFGDAFEAZ3iDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3gAZ3iDAFEAZ3gAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFFzDVYoR2yDAFGDAFGDAFEAZ3iDAFEA/k/sAAAAJ3RSTlMAA/OUke78c1Euz6cnEN8Q9HIf4jowSj0d0cWQqbxXZX5ipZdFR0S+6MnmAAAA2UlEQVRIx7XRyRKCMBBF0e4IARIgzCCTs+b/v1DUnUJV3sK7PpV0dROtdT0yuRf2yf/0HtJpB+kY0aKC9A3R8oRoe4T0yIhGFh5KZCmhtB6kgfss2u4Y0TJnQFvhdYC2dp/H7K6tTce86hJ21K+B0n708lN4r+J465a/SSEEBWtdzt5Xu3f0WMuPNkZs5kMw6EmVmYv+xKZoD4PK3PQn02jfXS9/tBOgiQqNaCoUomnOEG0mRFMA6dpHtFGAZtYZ8DYNkA6QuWmGdFPWgG4hHWFaIbqAtNEb+gmiHhucgjf5kwAAAABJRU5ErkJggg==)](https://research.csc.fi/) [![Rahti](https://img.shields.io/badge/Rahti-2C7D98?&labelColor=white&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAMAAAANxBKoAAAAe1BMVEVHcExZLWCDAFGDAFGDAFEAZ3iDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3gAZ3iDAFEAZ3gAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFFzDVYoR2yDAFGDAFGDAFEAZ3iDAFEA/k/sAAAAJ3RSTlMAA/OUke78c1Euz6cnEN8Q9HIf4jowSj0d0cWQqbxXZX5ipZdFR0S+6MnmAAAA2UlEQVRIx7XRyRKCMBBF0e4IARIgzCCTs+b/v1DUnUJV3sK7PpV0dROtdT0yuRf2yf/0HtJpB+kY0aKC9A3R8oRoe4T0yIhGFh5KZCmhtB6kgfss2u4Y0TJnQFvhdYC2dp/H7K6tTce86hJ21K+B0n708lN4r+J465a/SSEEBWtdzt5Xu3f0WMuPNkZs5kMw6EmVmYv+xKZoD4PK3PQn02jfXS9/tBOgiQqNaCoUomnOEG0mRFMA6dpHtFGAZtYZ8DYNkA6QuWmGdFPWgG4hHWFaIbqAtNEb+gmiHhucgjf5kwAAAABJRU5ErkJggg==)](https://rahti.csc.fi/)

This is a repository for further development of the news article collection tool based in repository [news-article-collection](https://github.com/uh-dcm/news-article-collection), originally developed by [matnel](https://github.com/matnel). This project extends the tool by containerizing it with Docker and optimizing it for deployment on the [CSC](https://research.csc.fi/) [Rahti 2](https://rahti.csc.fi/) service. It offers a web application built with TypeScript, React and Tailwind CSS, aided by Vite. The backend utilizes Python with Flask, JWT and APScheduler, with the SQLite database being sourced from the original tool. Testing is done via Vitest for frontend tests, Pytest for backend and Cypress for end-to-end tests.

This is being worked on as part of the University of Helsinki [Ohjelmistotuotantoprojekti TKT20007](https://github.com/HY-TKTL/TKT20007-Ohjelmistotuotantoprojekti) course for the summer of 2024.

[General project structure in Markdown](https://github.com/uh-dcm/news-article-collection-container/blob/main/docs/project-structure.md)

## Development documentation

- [Definition of Done & Practices](https://github.com/uh-dcm/news-article-collection-container/blob/main/docs/dod-practices.md)
- [Product Backlog](https://github.com/orgs/uh-dcm/projects/3/views/1)
- [Sprint 1 Task Board](https://github.com/orgs/uh-dcm/projects/6/views/1)
- [Sprint 2 Task Board](https://github.com/orgs/uh-dcm/projects/9/views/1)
- [Sprint 3 Task Board](https://github.com/orgs/uh-dcm/projects/10/views/1)
- [Sprint 4 Task Board](https://github.com/orgs/uh-dcm/projects/11/views/1)
- [Sprint 5 Task Board](https://github.com/orgs/uh-dcm/projects/13/views/1)
- [Sprint 6 Task Board](https://github.com/orgs/uh-dcm/projects/17/views/1)

## Starting the app

Make sure you have Docker installed!

From the root folder of the project, build and start the container:

```
docker compose up --build
```

After this, you can access the website at [http://localhost:4000/](http://localhost:4000/).

### Stopping the container

Press CTRL+C in the terminal for graceful shutdown.

Then either of the following:
1. `docker compose stop` for stopping the container without removing it, after which it can be started again with `docker compose start`
2. `docker compose down` for stopping and removing the container and its Docker network, and with flag `--rmi all` if you want to remove the image as well.

## Setting up dev environment

Starting from the root of the project:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Now the whole project environment should be running, with real-time changes rendered. Also reachable from http://localhost:4000/.
