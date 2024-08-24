"""
Tests basic index route responses and functions in routes.py.
"""
# Improvements:
# Refactored auth_headers fixture to return the headers directly.
# Additions:
# Added test_invalid_token to check the response for an invalid token.
# Added test_missing_token to check the response when no token is provided.
# Added test_protected_route_without_token to test access to a protected route 
# without a token.
# Added test_protected_route_with_valid_token to test access to a protected route 
# with a valid token.

import os
import shutil
import pytest
from flask_jwt_extended import create_access_token

@pytest.fixture
def auth_headers(client):
    """Fixture for token use in testing."""
    with client.application.app_context():
        access_token = create_access_token(identity='testuser')
    return {'Authorization': f'Bearer {access_token}'}

def test_serve_index(client):
    """Tests index route."""
    static_folder = client.application.static_folder
    index_path = os.path.join(static_folder, 'index.html')
    os.makedirs(static_folder, exist_ok=True)

    # Test without index.html
    response = client.get('/')
    assert response.status_code == 200

    # Create index.html and test with it
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write('<html><body>News article collector</body></html>')

    response = client.get('/')
    assert response.status_code == 200
    assert b"News article collector" in response.data

    shutil.rmtree(static_folder, ignore_errors=True)

@pytest.mark.usefixtures("auth_headers")
def test_get_is_valid_token(client, auth_headers):
    """Tests valid token."""
    response = client.get('/api/get_is_valid_token', headers=auth_headers)
    assert response.status_code == 200
    assert response.json['valid'] is True

# Added test_invalid_token to check the response for an invalid token.
def test_invalid_token(client):
    """Tests invalid token."""
    response = client.get('/api/get_is_valid_token', headers={'Authorization': 'Bearer invalidtoken'})
    assert response.status_code == 200

# Added test_missing_token to check the response when no token is provided.
def test_missing_token(client):
    """Tests missing token."""
    response = client.get('/api/get_is_valid_token')
    assert response.status_code == 200

# Added test_protected_route_without_token to test access to 
# a protected route without a token.
def test_protected_route_without_token(client):
    """Tests access to a protected route without a token."""
    response = client.get('/api/protected_route')
    assert response.status_code == 200

# Added test_protected_route_with_valid_token to test access to 
# a protected route with a valid token.
def test_protected_route_with_valid_token(client, auth_headers):
    """Tests access to a protected route with a valid token."""
    response = client.get('/api/protected_route', headers=auth_headers)
    assert response.status_code == 200
