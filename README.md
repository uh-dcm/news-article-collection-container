# News Article Collection Container

## Legal disclamer

Thank you for choosing our software!
We are happy to have you here, and strive to provide you the best experience.
Please keep in mind that it is your responsibility to make sure you use the software only for legal and permitted purposes - we cannot guarantee that the product is suitable for any specific purpose or need you might have.

# OHTU

[![CI Status](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/main.yml/badge.svg)](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/main.yml) [![CD Status](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/release.yml/badge.svg)](https://github.com/uh-dcm/news-article-collection-container/actions/workflows/release.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://www.helsinki.fi/en/center-information-technology/about-it-center/open-source-code-principles) [![CSC](https://img.shields.io/badge/CSC-white?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAMAAAANxBKoAAAAe1BMVEVHcExZLWCDAFGDAFGDAFEAZ3iDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3gAZ3iDAFEAZ3gAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFFzDVYoR2yDAFGDAFGDAFEAZ3iDAFEA/k/sAAAAJ3RSTlMAA/OUke78c1Euz6cnEN8Q9HIf4jowSj0d0cWQqbxXZX5ipZdFR0S+6MnmAAAA2UlEQVRIx7XRyRKCMBBF0e4IARIgzCCTs+b/v1DUnUJV3sK7PpV0dROtdT0yuRf2yf/0HtJpB+kY0aKC9A3R8oRoe4T0yIhGFh5KZCmhtB6kgfss2u4Y0TJnQFvhdYC2dp/H7K6tTce86hJ21K+B0n708lN4r+J465a/SSEEBWtdzt5Xu3f0WMuPNkZs5kMw6EmVmYv+xKZoD4PK3PQn02jfXS9/tBOgiQqNaCoUomnOEG0mRFMA6dpHtFGAZtYZ8DYNkA6QuWmGdFPWgG4hHWFaIbqAtNEb+gmiHhucgjf5kwAAAABJRU5ErkJggg==)](https://my.csc.fi/) [![Rahti](https://img.shields.io/badge/Rahti-2C7D98?&labelColor=white&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAMAAAANxBKoAAAAe1BMVEVHcExZLWCDAFGDAFGDAFEAZ3iDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3gAZ3iDAFEAZ3gAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFGDAFEAZ3iDAFEAZ3gAZ3gAZ3iDAFGDAFFzDVYoR2yDAFGDAFGDAFEAZ3iDAFEA/k/sAAAAJ3RSTlMAA/OUke78c1Euz6cnEN8Q9HIf4jowSj0d0cWQqbxXZX5ipZdFR0S+6MnmAAAA2UlEQVRIx7XRyRKCMBBF0e4IARIgzCCTs+b/v1DUnUJV3sK7PpV0dROtdT0yuRf2yf/0HtJpB+kY0aKC9A3R8oRoe4T0yIhGFh5KZCmhtB6kgfss2u4Y0TJnQFvhdYC2dp/H7K6tTce86hJ21K+B0n708lN4r+J465a/SSEEBWtdzt5Xu3f0WMuPNkZs5kMw6EmVmYv+xKZoD4PK3PQn02jfXS9/tBOgiQqNaCoUomnOEG0mRFMA6dpHtFGAZtYZ8DYNkA6QuWmGdFPWgG4hHWFaIbqAtNEb+gmiHhucgjf5kwAAAABJRU5ErkJggg==)](https://rahti.csc.fi/)

This is a repository for further development of the news article collection tool based in repository [news-article-collection](https://github.com/uh-dcm/news-article-collection), originally developed by [matnel](https://github.com/matnel). This project extends the tool by containerizing it with Docker and optimizing it for deployment on the [CSC](https://my.csc.fi/) [Rahti 2](https://rahti.csc.fi/) OpenShift service. It offers a web application built with TypeScript, React and Tailwind CSS, aided by Vite. The backend utilizes Python with Flask, JWT and APScheduler, with the SQLite database being sourced from the original tool. Testing is done via Vitest for frontend tests, Pytest for backend and Cypress for end-to-end tests.

This was worked on as part of the University of Helsinki [Ohjelmistotuotantoprojekti TKT20007](https://github.com/HY-TKTL/TKT20007-Ohjelmistotuotantoprojekti) course for the summer of 2024.

Front page screenshot:
<p align="center">
  <img src="./docs/frontpage.jpg" alt="Front Page Screenshot" width="600">
</p>

Short action charts for developer and user (see more in [rahti-guide.md](./docs/rahti-guide.md)):
```mermaid
graph TD
    subgraph User
    C[Start CSC project]:::userStyle --> D[Register project in requested Rahti]:::userStyle
    D --> E[Use manifest yaml in Rahti]:::userStyle
    end
    subgraph Developer
    A[Commit]:::devStyle --> B[Release]:::devStyle
    end
    
    classDef userStyle fill:#e6ffee,stroke:#333,stroke-width:2px,color:#888888;
    classDef devStyle fill:#e6f3ff,stroke:#333,stroke-width:2px,color:#888888;
    classDef subgraphStyle fill:none,stroke:none;
    class User,Developer subgraphStyle;
```

Chart of the CD triggered by a release:
```mermaid
graph LR
    A[GitHub - Main Branch] -->|Release| B[GitHub Actions]
    C -->|ImageStream| D[Rahti OpenShift]
    
    subgraph docker_build["Docker Image Build"]
    C1[Build Client]
    C2[Build Server]
    C3[Image]
    C1 --> C3
    C2 --> C3
    end
    B ---> C1
    B ---> C2
    C3 -->|Push| C[Docker Hub]
    
    linkStyle 0 stroke:#ff3e00,stroke-width:2px;
    
    classDef subgraphStyle fill:#f0f4f8,stroke:#d1dce8,stroke-width:1px;
    class docker_build subgraphStyle;

    style docker_build color:#888888,fill:#f0f4f8,stroke:#d1dce8,stroke-width:1px
```

Graph of the directories of the main functionalities:
```mermaid
graph TD
    A[news-article-collection-container] --> C[client]
    A --> F[server]

    C --> C1[public]
    C --> C2[src]
    C --> C3[tests]

    C2A --> C2A1[ui]

    C2 --> C2A[components]
    C2 --> C2B[css]
    C2 --> C2C[features]
    C2 --> C2D[lib]
    C2 --> C2E[services]

    C2C --> C2C1[dashboard]
    C2C --> C2C2[errors]
    C2C --> C2C3[info]
    C2C --> C2C4[search]
    C2C --> C2C5[statistics]
    C2C --> C2C6[user]

    F --> F1[src]
    F --> F2[tests]

    F1 --> F1A[views]
    F1 --> F1B[utils]

    F1A --> F1A1[administration]
    F1A --> F1A2[data_acquisition]
    F1A --> F1A3[data_analysis]
    F1A --> F1A4[data_export]

    G[news-article-collection] --> G1[collect.py]
    G --> G2[database.py]
    G --> G3[process.py]
```

## Development documentation

- [Definition of Done & Practices](./docs/dod-practices.md)
- [Product Backlog](https://github.com/orgs/uh-dcm/projects/3/views/1)
- Summer 2024 task boards: [Sprint 1](https://github.com/orgs/uh-dcm/projects/6/views/1), [Sprint 2](https://github.com/orgs/uh-dcm/projects/9/views/1), [Sprint 3](https://github.com/orgs/uh-dcm/projects/10/views/1), [Sprint 4](https://github.com/orgs/uh-dcm/projects/11/views/1), [Sprint 5](https://github.com/orgs/uh-dcm/projects/13/views/1), [Sprint 6](https://github.com/orgs/uh-dcm/projects/17/views/1)
- [Future development](./docs/future-development.md)

## Starting the app locally

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
