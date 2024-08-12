# Server or backend structure

The server uses Python with Flask, JWT and APScheduler. Tests are Pytest with linting by Pylint.

The main backend application is located in `src`, with its dependencies being in requirements.txt. Note that the root Dockerfile installs the original tool news-article-collection into folder `rss-fetcher` here, which contains database.py, collect.py, process.py and its own requirements.txt. The tests are in the `tests` folder, with requirements-dev.txt installing extra dependencies for testing, coverage and linting. There is also pytest.ini here which guides Pytest, and .pylintrc at root which automatically guides code editors on using Pylint there. The Dockerfile and Dockerfile.dev are only used in development to run the server separately and with different settings.

The application is ran through app.py in the source folder, which uses configs in the config.py file. And routes.py represents the basic Flask endpoints, that are only calling upon fuller functions in the views folder, which is split into further categorization of these as administration, which is just general site running endpoints, and the more specific data collection and usage related ones data_acquisition, data_analysis and data_export. The utils folder represents utility functions, usually ones used and shared by multiple endpoint functions. 

The tests folder has conftest.py, which is the more specific configuration file for the Pytests, and views folder endpoint tests are in the test_views folder. Testing also generates .gitignored coverage files in the tests folder.
