# Place at project root, run there in terminal with: bash runtests.sh

# Things that may help in rare non-code related issues:
# 1. npm depency discrepancy issue: 
# delete node_modules folder, let it get reinstalled by this script fresh
# 2. docker build not starting:
# restart your system's Docker (Docker Desktop etc.)
# run "docker system prune" to free up resources
# 3. terminal window affected by something: 
# close the terminal window and open a fresh one

run_pytests() {
    echo "Setting up venv for Pytests"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r server/requirements.txt -r server/requirements-dev.txt
    echo "Running Pytests"
    cd server
    pytest --cov=. --cov-report=term --cov-report=html:tests/coverage
    echo "Pytests done"
    cd ..
}

run_pylint() {
    echo "Running Pylint check"
    pylint --recursive=y --fail-under=7 server
    echo "Pylint check done"
    deactivate
}

run_vitests() {
    echo "Running Vitests"
    cd client
    npm install
    npm test
    echo "Vitests done"
}

run_eslint() {
    echo "Running ESLint check"
    if npm run lint --silent; then
        echo "ESLint: OK! Everything looks fine."
    else
        echo "ESLint: Problems found!"
    fi
    echo "ESLint check done"
    cd ..
}

run_cypress_tests() {
    echo "Starting container build"
    docker compose up --build -d
    echo "Running Cypress tests"
    cd client
    npx cypress run
    echo "Cypress tests done"
    cd ..
    echo "Stopping container"
    docker compose down --rmi all
}


generate_coverage_report_html() {
    if [ ! -f "coverage-reports.html" ]; then
        cat > coverage-reports.html << EOL
<!DOCTYPE html>
<html>
<body>
    <h1>Coverage Reports</h1>
    <div class="report-link">
        <img src="https://raw.githubusercontent.com/vitest-dev/vitest/main/docs/public/logo.svg" width="100" height="100">
        <a href="client/tests/coverage/index.html">Vitest Coverage Report</a>
    </div>
    <br>
    <div class="report-link">
        <img src="https://raw.githubusercontent.com/pytest-dev/pytest/main/doc/en/img/pytest_logo_curves.svg" width="100" height="100">
        <a href="server/tests/coverage/index.html">Pytest Coverage Report</a>
    </div>
</body>
</html>
EOL
        echo "Generated coverage-reports.html. You can read the detailed coverage reports in it."
    else
        echo "You can read the detailed coverage reports in coverage-reports.html."
    fi
}

echo "Starting tests"

run_pytests
sleep 1

run_pylint
sleep 1

run_vitests
sleep 1

run_eslint
sleep 1

run_cypress_tests
sleep 1

generate_coverage_report_html

echo "Tests ended"
