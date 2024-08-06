#!/bin/bash

# Quick Py and Vi test script after first running the dependency installing runtests.sh
# Run in terminal at root with "bash quicktest.sh" or "./quicktest.sh"
# If "Permission denied", run "chmod +x quicktest.sh" once

echo "Running Pytests"
source venv/bin/activate
cd server
COVERAGE_FILE=tests/.coverage pytest
echo "Pytests done"
cd ..
deactivate

echo "Running Vitests"
cd client
npm test
echo "Vitests done"
cd ..
