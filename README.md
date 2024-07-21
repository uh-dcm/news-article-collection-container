# news-article-collection-container

[![GHA workflow Badge](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/main.yml/badge.svg)](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/main.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a repository for further development of the news article collection tool based in repository [news-article-connection](https://github.com/uh-dcm/news-article-collection), originally developed by [matnel](https://github.com/matnel).

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

## Starting the app

Make sure you have Docker installed!

From the root folder of the project, start the container:

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

Starting from the root of the project

```bash
docker compose -f docker-compose.dev.yml up --build
```

Now the whole project environment should be running, with real-time changes rendered. Also reachable from http://localhost:4000/.
