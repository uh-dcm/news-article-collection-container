"""
Tests basic app.py route responses and functions.
"""
import os
import shutil
import pytest
from flask_jwt_extended import create_access_token

@pytest.fixture
def auth_headers(client):
    """
    Fixture for token use in testing. Only used by test_get_is_valid_token().
    """
    with client.application.app_context():
        access_token = create_access_token(identity='testuser')
    client.auth_headers = {'Authorization': f'Bearer {access_token}'}

def test_serve_index(client):
    """
    Tests index. Only test that needs index.html setup.
    """
    static_folder = client.application.static_folder
    index_path = os.path.join(static_folder, 'index.html')
    os.makedirs(static_folder, exist_ok=True)

    # without index path
    response = client.get('/')
    assert response.status_code == 404

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write('<html><body>News article collector</body></html>')

    # with index path
    response = client.get('/')
    assert response.status_code == 200
    assert b"News article collector" in response.data

    shutil.rmtree(static_folder, ignore_errors=True)

@pytest.mark.usefixtures("auth_headers")
def test_get_is_valid_token(client):
    """
    Tests valid token, using the token fixture.
    """
    response = client.get('/api/get_is_valid_token', headers=client.auth_headers)
    assert response.status_code == 200
    assert response.json['valid'] is True
