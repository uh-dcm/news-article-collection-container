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
    pip install -r server/requirements.txt
    echo "Running Pytests"
    cd server
    pytest
    echo "Pytests done"
    deactivate
    cd ..
}

run_vitests() {
    echo "Running Vitests"
    cd client
    npm install
    npm test
    echo "Vitests done"
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
    docker compose down
}

echo "Starting tests"

run_pytests
sleep 1

run_vitests
sleep 1

run_cypress_tests

echo "Tests ended"
