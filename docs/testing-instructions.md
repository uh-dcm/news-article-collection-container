# Testing instructions

## Test script

You can run the automated tests script at project root in a terminal with simply:
`bash runtests.sh`

After running it and installing the dependencies, you can run the frontend and backend tests alone and much more quickly with `bash quicktest.sh`.

## Detailed testing

### Backend tests (Pytest) <sup><sub>File location: /server/tests/</sub></sup>
- `python3 -m venv venv` (install venv folder, an isolated Python environment)

- `source venv/bin/activate` (activate venv)

- `pip install -r server/requirements.txt -r server/requirements-dev.txt` (install dependencies into venv)

- `pylint --recursive=y --fail-under=7 server` (run Pylint check)

- `cd server` (move to server folder)

- `pytest` (run Pytests with automated coverage check, which you can read in more detail at server/tests/coverage/index.html) (or more preferably `COVERAGE_FILE=tests/.coverage pytest` to tuck away the .coverage in the tests folder like the scripts do)

- `deactivate` (deactivate venv)

- `cd ..` (move back to root)

### Frontend tests (Vitest) <sup><sub>File location: /client/tests/internal/</sub></sup>
- `cd client` (move to the client folder)

- `npm install` (install dependencies to node_modules)

- `npm run lint` (run ESLint check, if no problems then ok)

- `npm test` (run Vitests with automated coverage check, the detailed version of which you can read at client/tests/coverage/index.html)

### E2E tests (Cypress) <sup><sub>File location: /client/tests/e2e/</sub></sup>
- Open a new terminal window next to the main testing window and in it:
  
- `docker compose up --build` (run the app normally)

- Then in the main testing window:
  
- `cd client` (if not done already)

- `npm install` (also if not done already)

- `npx cypress run` (run Cypress tests)

- When the test finishes, you can run in the other window:

- `docker compose down --rmi all` (removes what was built, besides some cache)
