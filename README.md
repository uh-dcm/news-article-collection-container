# news-article-collection-container

This is a repository for further development of the news article collection tool based in repository [news-article-connection](https://github.com/uh-dcm/news-article-collection), originally developed by [matnel](https://github.com/matnel).

This is being worked on as part of the University of Helsinki [Ohjelmistuotantoprojekti TKT20007](https://github.com/HY-TKTL/TKT20007-Ohjelmistotuotantoprojekti) course for the summer of 2024.

## Development Documentation

- [Definition of Done & Practices](https://github.com/uh-dcm/news-article-collection-container/blob/main/DoD%26Practices.md)
- [Product Backlog](https://github.com/orgs/uh-dcm/projects/3/views/1)
- [Sprint 1 Task Board](https://github.com/orgs/uh-dcm/projects/6/views/1)

## Starting the app

Make sure you have Docker installed!

From the root folder of the project, start the container:
```
docker compose up --build
```

Now in another terminal instance, do this to attach to the container:
```
docker attach news-fetcher-container
```

While you're inside the container, run the following command to start the Flask backend:
```
cd server && python app.py
```

After all these, you can access the website at [http://localhost:4000/](http://localhost:4000/).

### Stopping the server
Do either ONE of the following:

1. Stop the server by either typing Ctrl+C to exit the python script (flask) and then typing `exit` to stop the container.
2. Type `docker compose down` at the root folder of the project. 
