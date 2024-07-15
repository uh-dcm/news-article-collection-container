# Testing

You can run the automated tests script at root with simply:
- `$ bash runtests.sh`

### Backend unit tests (Pytest) <sup><sub>File location: /server/tests/</sub></sup>
- `$ python3 -m venv venv` (install venv folder, an isolated Python environment)

- `$ source venv/bin/activate` (activate venv)

- `$ pip install -r server/requirements.txt` (install dependencies into venv)

- `$ cd server` (move to server folder)

- `$ pytest` (run Pytests)

- `$ deactivate` (deactivate venv)

- `$ cd ..` (move back to root)

### Frontend unit and integration tests (Vitest) <sup><sub>File location: /client/tests/internal/</sub></sup>
- `$ cd client` (move to the client folder)

- `$ npm install` (install dependencies to node_modules)

- `$ npm test` (run Vitests)

### E2E tests (Cypress) <sup><sub>File location: /client/tests/e2e/</sub></sup>
- Open a new CLI window next to the main testing window and in it:
  
- `$ docker compose up --build` (run the app normally)

- Then in the main testing window:
  
- `$ cd client` (if not done already)

- `$ npm install` (also if not done already)

- `$ npx cypress run` (run Cypress tests)
