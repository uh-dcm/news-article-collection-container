"""
Test mail_dispatcher.py functions and related error handling.
Note: The related endpoint is not tested.
"""
from unittest.mock import patch, Mock
from smtplib import SMTPAuthenticationError, SMTPConnectError
import pytest

from src.views.administration.mail_dispatcher import create_email, send_email

@pytest.fixture(name="mock_request_data")
def fixture_mock_request_data():
    """Fixture to provide mock request data for email sending tests."""
    return {'password': 'test', 'email': 'test@test.com'}

def send_email_request_context(client, request_data):
    """Helper function to send email within a test request context."""
    with client.application.test_request_context(json=request_data):
        return send_email()

def test_create_email():
    """Test the creation of an email message."""
    password = 'test_password'
    email = 'test@test.com'
    host_url = 'http://localhost:5000'
    email_message = create_email(host_url, password, email)

    assert email_message['From'] == ''  # This should match SERVER_EMAIL in mail_dispatcher.
    assert email_message['To'] == email
    assert email_message['Subject'] == 'Password for the News Article Collector'

    expected_body = f'Here is your password ({password}) for the app ({host_url})'

    # Remove line breaks added by EmailMessage's set_content() with strip().
    assert email_message.get_payload().strip() == expected_body

@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_success(mock_smtp, client, mock_request_data):
    """Test successful email sending."""
    mock_instance = Mock()
    mock_smtp.return_value.__enter__.return_value = mock_instance

    response = send_email_request_context(client, mock_request_data)

    assert response[1] == 200
    assert response[0].json['message'] == 'Email sent successfully'

@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_auth_error(mock_smtp, client, mock_request_data):
    """Test email sending with authentication error."""
    mock_smtp.side_effect = SMTPAuthenticationError(1, 'Authentication failed')

    response = send_email_request_context(client, mock_request_data)

    assert response[1] == 401
    assert response[0].json['message'] == 'Authentication to the email service provider failed'

@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_connection_error(mock_smtp, client, mock_request_data):
    """Test email sending with connection error."""
    mock_smtp.side_effect = SMTPConnectError(1, 'Connection failed')

    response = send_email_request_context(client, mock_request_data)

    assert response[1] == 503
    assert response[0].json['message'] == 'Connection to the email service provider failed'

@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_general_error(mock_smtp, client, mock_request_data):
    """Test email sending with a general error."""
    mock_smtp.side_effect = Exception('General error')

    response = send_email_request_context(client, mock_request_data)

    assert response[1] == 500
    assert response[0].json['message'] == 'Email was not sent successfully'
