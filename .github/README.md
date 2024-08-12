# Workflows readme
There are 4 workflows: main, release, playground and local.

- `main.yml` is the main CI workflow ran for all branches except playground, split into jobs client-checks (Vitest and Eslint), server-checks (Pytest and Pylint) and e2e-checks (regular build and Cypress)
- `release.yml` is the CD workflow that builds and pushes an image of the main branch to Docker Hub's `ohtukontitus/news-collection:latest` to be used by any image streams watching it, like at Rahti, and it's activated by new releases
- `playground.yml` is for the playground branch which as name implies is for playing around in development
- `local.yml` is a customized workflow for local runs
