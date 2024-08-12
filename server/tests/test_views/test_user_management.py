"""
Tests user_management.py route responses and functions.
"""
import os
import json
import pytest

# tests that register a user require the fixture for teardown
@pytest.mark.usefixtures("setup_and_teardown")
def test_register(client):
    """Tests user register."""
    response = client.post(
        '/api/register', json={'email': 'test@helsinki.fi', 'password': 'testpassword'}
    )
    assert response.status_code == 200
    assert response.json['msg'] == "User created"

@pytest.mark.usefixtures("setup_and_teardown")
def test_login(client):
    """Tests user login."""
    client.post(
        '/api/register', json={'email': 'test@helsinki.fi', 'password': 'testpassword'}
    )
    response = client.post('/api/login', json={'password': 'testpassword'})
    assert response.status_code == 200
    assert 'access_token' in response.json

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_user_exists_false(client):
    """Tests /api/get_user_exists when user doesn't exist."""
    response = client.get('/api/get_user_exists')
    assert response.status_code == 200
    assert 'exists' in response.json
    assert response.json['exists'] is False, "API should report that user does not exist"

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_user_exists_true(client):
    """Tests /api/get_user_exists when user exists."""
    client.post(
        '/api/register', json={'email': 'test@helsinki.fi', 'password': 'testpassword'}
    )
    response = client.get('/api/get_user_exists')
    assert response.status_code == 200
    assert 'exists' in response.json
    assert response.json['exists'] is True, "API should report that user exists"

@pytest.mark.usefixtures("setup_and_teardown")
def test_user_data_structure(client, app_config):
    """Tests the structure of the user data stored in the JSON file."""
    client.post(
        '/api/register', json={'email': 'test@helsinki.fi', 'password': 'testpassword'}
    )
    user_file_path = os.path.join(app_config['FETCHER_FOLDER'], 'data', 'user.json')
    assert os.path.exists(user_file_path), "User file should exist after registration"

    with open(user_file_path, 'r', encoding='utf-8') as f:
        user_data = json.load(f)

    assert 'email' in user_data, "User data should contain email"
    assert 'password' in user_data, "User data should contain password hash"
    assert user_data['email'] == 'test@helsinki.fi', "Email should match registered email"
    assert user_data['password'].startswith('scrypt:'), "Password should be scrypt hashed"

@pytest.mark.usefixtures("setup_and_teardown")
def test_register_another_user(client):
    """Tests registering a user when one already exists."""
    client.post(
        '/api/register', json={'email': 'test@helsinki.fi', 'password': 'testpassword'}
    )
    response = client.post(
        '/api/register', json={'email': 'test2@helsinki.fi', 'password': 'testpassword2'}
    )
    assert response.status_code == 409
    assert response.json['msg'] == "User already exists"
