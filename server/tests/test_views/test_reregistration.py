"""
Test reregistration.py.
"""
from unittest.mock import patch
import pytest
from itsdangerous import URLSafeTimedSerializer

@pytest.mark.usefixtures("setup_and_teardown")
def test_request_reregister_user_not_found(client):
    """
    Test reregister user not found.
    """
    with patch('src.views.administration.reregistration.get_user_data', return_value=None):
        response = client.post('/api/request_reregister')
        assert response.status_code == 404
        assert response.json['msg'] == "User does not exist"

@pytest.mark.usefixtures("setup_and_teardown")
def test_request_reregister_success(client):
    """
    Test reregister success.
    """
    with patch(
        'src.views.administration.reregistration.get_user_data',
        return_value={'email': 'test@example.com'}
    ):
        response = client.post('/api/request_reregister')

        assert response.status_code == 200
        assert 'msg' in response.json
        assert response.json['msg'] == "Reregistration link generated"
        assert 'reregister_link' in response.json
        assert response.json['reregister_link'].startswith('http')
        assert '/reregister/' in response.json['reregister_link']

@pytest.mark.usefixtures("setup_and_teardown")
def test_validate_reregister_token_valid(app, client):
    """
    Test reregister valid token.
    """
    serializer = URLSafeTimedSerializer(app.config['REREGISTER_SECRET_KEY'])
    token = serializer.dumps('test@example.com')

    response = client.get(f'/api/validate_reregister_token/{token}')
    assert response.status_code == 200
    assert response.json['valid'] is True
    assert response.json['email'] == 'test@example.com'

@pytest.mark.usefixtures("setup_and_teardown")
def test_validate_reregister_token_invalid(client):
    """
    Test reregister invalid token.
    """
    response = client.get('/api/validate_reregister_token/invalid_token')
    assert response.status_code == 400
    assert response.json['valid'] is False
