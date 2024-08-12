"""
Tests user_management.py route responses and functions.
"""
import os
import pytest

# tests that register a user require the fixture for teardown
@pytest.mark.usefixtures("setup_and_teardown")
def test_register(client):
    """Tests user register."""
    response = client.post('/api/register', json={'password': 'testpassword'})
    assert response.status_code == 200
    assert response.json['msg'] == "User created"

@pytest.mark.usefixtures("setup_and_teardown")
def test_login(client):
    """Tests user login."""
    client.post('/api/register', json={'password': 'testpassword'})
    response = client.post('/api/login', json={'password': 'testpassword'})
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_get_user_exists_false(client, app_config):
    """Tests /api/get_user_exists when user doesn't exist."""
    password_file_path = os.path.join(app_config['FETCHER_FOLDER'], 'data', 'password.txt')
    assert not os.path.exists(password_file_path), "Password file should not exist before test"

    response = client.get('/api/get_user_exists')

    assert response.status_code == 200
    assert 'exists' in response.json
    assert response.json['exists'] is False, "API should report that user does not exist"

    assert not os.path.exists(password_file_path), "Password file should not exist after test"

@pytest.mark.usefixtures("setup_and_teardown")
def test_get_user_exists_true(client, app_config):
    """Tests /api/get_user_exists when user exists."""
    password_file_path = os.path.join(app_config['FETCHER_FOLDER'], 'data', 'password.txt')
    assert not os.path.exists(password_file_path), "Password file should not exist before test"

    # register
    register_response = client.post('/api/register', json={'password': 'testpassword'})
    assert register_response.status_code == 200, "User registration should succeed"

    response = client.get('/api/get_user_exists')

    assert response.status_code == 200
    assert 'exists' in response.json
    assert response.json['exists'] is True, "API should report that user exists"

    assert os.path.exists(password_file_path), "Password file should exist after registration"

# Ensure the system handles attempts to register a user that already exists.
@pytest.mark.usefixtures("setup_and_teardown")
def test_register_duplicate_user(client):
    """Tests registering a user that already exists."""
    client.post('/api/register', json={'password': 'testpassword'})
    response = client.post('/api/register', json={'password': 'testpassword'})
    assert response.status_code == 400
    assert response.json['msg'] == "User already exists"

# Verify the behavior when an invalid password format is provided during registration.
@pytest.mark.usefixtures("setup_and_teardown")
def test_register_invalid_password_format(client):
    """Tests registering with an invalid password format."""
    response = client.post('/api/register', json={'password': ''})
    assert response.status_code == 400
    assert response.json['msg'] == "Invalid password format"

# Ensure the system handles login attempts with incorrect passwords.
@pytest.mark.usefixtures("setup_and_teardown")
def test_login_incorrect_password(client):
    """Tests logging in with an incorrect password."""
    client.post('/api/register', json={'password': 'testpassword'})
    response = client.post('/api/login', json={'password': 'wrongpassword'})
    assert response.status_code == 401
    assert response.json['msg'] == "Incorrect password"
