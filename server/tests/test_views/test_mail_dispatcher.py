"""
Test mail_dispatcher.py functions and related error handling.
Note: The related endpoint is not tested.
"""
from unittest.mock import patch, Mock
from smtplib import SMTPAuthenticationError, SMTPConnectError
import pytest

from src.views.administration.mail_dispatcher import create_email, send_email


@pytest.fixture(name="mock_request")
def fixture_mock_request():
    """Fixture to provide a mock request object."""
    class MockRequest:
        def __init__(self):
            self.host_url = 'http://localhost:5000'
            self.json = {
                'password': 'test',
                'email': 'test@test.com'
            }

    return MockRequest()

def test_create_email():
    """Test the creation of an email message."""
    password = 'test_password'
    email = 'test@test.com'
    host_url = 'http://localhost:5000'
    email_message = create_email(host_url, password, email)

    # EmailMessage converts None to string
    assert email_message['From'] == 'None'
    assert email_message['To'] == email
    assert email_message['Subject'] == 'Password for the News Article Collector'

    expected_body = f'Here is your password ({password}) for the app ({host_url})'

    # Remove line breaks added by EmailMessage's set_content() with strip().
    assert email_message.get_payload().strip() == expected_body

@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_success(mock_smtp, app, mock_request):
    """Test successful email sending."""
    mock_instance = Mock()
    mock_smtp.return_value.__enter__.return_value = mock_instance

    with app.app_context():
        response = send_email(mock_request)

    assert response == 'Email sent successfully'

@pytest.mark.usefixtures("setup_and_teardown")
@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_auth_error(mock_smtp, app, mock_request):
    """Test email sending with authentication error."""
    mock_smtp.side_effect = SMTPAuthenticationError(1, 'Authentication failed')

    with app.app_context():
        response = send_email(mock_request)

    assert response == 'Authentication to the email server failed'

@pytest.mark.usefixtures("setup_and_teardown")
@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_connection_error(mock_smtp, app, mock_request):
    """Test email sending with connection error."""
    mock_smtp.side_effect = SMTPConnectError(1, 'Connection failed')

    with app.app_context():
        response = send_email(mock_request)

    assert response == 'Connection to the email server failed'

@pytest.mark.usefixtures("setup_and_teardown")
@patch('src.views.administration.mail_dispatcher.smtplib.SMTP_SSL')
def test_send_email_general_error(mock_smtp, app, mock_request):
    """Test email sending with a general error."""
    mock_smtp.side_effect = Exception('General error')

    with app.app_context():
        response = send_email(mock_request)

    assert response == 'Failed to send email for an unknown reason'
