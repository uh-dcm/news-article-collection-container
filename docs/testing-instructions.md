# Testing

### Backend unit tests (Pytest)
- `$ python3 -m venv venv` (install venv folder, an isolated Python environment)

- `$ source venv/bin/activate` (activate venv)

- `$ pip install -r server/requirements.txt` (install dependencies into venv)

- `$ pytest` (run Pytests)

- `$ deactivate` (deactivate venv, you can remove venv folder if you want)

### Frontend unit and integration tests (Vitest)
- `$ cd client` (move to the client folder)

- `$ npm install` (install dependencies to node_modules)

- `$ npm test` (run Vitests)

### E2E tests (Cypress)
- Open a new CLI window next to the main testing window and in it:
  
- `$ docker compose up --build` (run the app normally)

- Then in the main testing window:
  
- `$ cd client` (if not done already)

- `$ npm install` (also if not done already)

- `$ npx cypress run` (run Cypress tests, remove node_modules if you want)
