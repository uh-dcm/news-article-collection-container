# Testing

You can run the automated tests script at root with simply:
- `$ bash runtests.sh`

### Backend unit tests (Pytest) <sup><sub>File location: /server/tests/</sub></sup>
- `$ python3 -m venv venv` (install venv folder, an isolated Python environment)

- `$ source venv/bin/activate` (activate venv)

- `$ pip install -r server/requirements.txt -r server/requirements-dev.txt` (install dependencies into venv)

- `$ pylint --recursive=y --fail-under=7 server` (run Pylint check)

- `$ cd server` (move to server folder)

- `$ pytest --cov=. --cov-report=term --cov-report=html:tests/coverage` (run Pytests with coverage check and generate a detailed coverage report, that you can read in more detail via server/coverage/index.html)

- `$ deactivate` (deactivate venv)

- `$ cd ..` (move back to root)

### Frontend unit and integration tests (Vitest) <sup><sub>File location: /client/tests/internal/</sub></sup>
- `$ cd client` (move to the client folder)

- `$ npm install` (install dependencies to node_modules)

- `$ npm run lint` (run ESLint check, if no problems then ok)

- `$ npm test` (run Vitests with automatic coverage check, the detailed version of which you can read via client/tests/coverage/index.html)

### E2E tests (Cypress) <sup><sub>File location: /client/tests/e2e/</sub></sup>
- Open a new terminal window next to the main testing window and in it:
  
- `$ docker compose up --build` (run the app normally)

- Then in the main testing window:
  
- `$ cd client` (if not done already)

- `$ npm install` (also if not done already)

- `$ npx cypress run` (run Cypress tests)

- When the test finishes, you can run in the other window:

- `$ docker compose down --rmi all` (removes what was built, besides cache)
