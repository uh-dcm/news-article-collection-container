"""
Test mail_dispatcher.py functions and related error handling.
Note: The related endpoint/route is not tested.
"""
# pylint: disable=too-few-public-methods
import textwrap
from unittest.mock import patch, Mock
from smtplib import SMTPException
import logging
import pytest

from src.utils.mail_dispatcher import (
    send_email,
    send_welcome_email,
    send_reregister_request_email,
    send_reregister_confirmation_email
)

@pytest.fixture(name="mock_request")
def fixture_mock_request():
    """Mock request fixture for the mail tests.."""
    class MockRequest:
        """Mocking a very simple request."""
        def __init__(self):
            self.host_url = 'http://localhost:4000'
            self.json = {
                'password': 'test_password',
                'email': 'test@test.com'
            }

    return MockRequest()

@patch('src.utils.mail_dispatcher.send_email')
def test_send_welcome_email(mock_send_email, mock_request):
    """Test sending welcome email."""
    send_welcome_email(mock_request, 'test_password')
    mock_send_email.assert_called_once()
    call_args = mock_send_email.call_args[0]
    assert call_args[0] == 'test@test.com'
    assert call_args[1] == "Welcome to using the UH-DCM News Article Collector"
    expected_content = textwrap.dedent("""
        Hello and welcome to using the UH-DCM News Article Collector!

        You can access the application at: http://localhost:4000

        Your password is: test_password

        Best regards,
        University of Helsinki, Digital and Computational Methods
        """).strip()
    assert call_args[2].strip() == expected_content

@patch('src.utils.mail_dispatcher.send_email')
def test_send_reregister_request_email(mock_send_email, mock_request):
    """Test sending reregister request email."""
    send_reregister_request_email(
        mock_request.host_url,
        mock_request.json['email'],
        'http://localhost:4000/reregister/XtokenX'
    )
    mock_send_email.assert_called_once()
    call_args = mock_send_email.call_args[0]
    assert call_args[0] == 'test@test.com'
    assert call_args[1] == "Renew your UH-DCM News Article Collector user details"
    expected_content = textwrap.dedent("""
        Hello UH-DCM News Article Collector user, we've received a request to renew your details at:
        http://localhost:4000

        To complete the process and update your details, please use the following link:

        http://localhost:4000/reregister/XtokenX

        Best regards,
        University of Helsinki, Digital and Computational Methods
        """).strip()
    assert call_args[2].strip() == expected_content

@patch('src.utils.mail_dispatcher.send_email')
def test_send_reregister_confirmation_email(mock_send_email, mock_request):
    """Test sending reregister confirmation email."""
    send_reregister_confirmation_email(mock_request, 'new_password')
    mock_send_email.assert_called_once()
    call_args = mock_send_email.call_args[0]
    assert call_args[0] == 'test@test.com'
    assert call_args[1] == "Your UH-DCM News Article Collector user details have been updated"
    expected_content = textwrap.dedent("""
        Hello UH-DCM News Article Collector user, your user details have been successfully updated.

        You can access the application at: http://localhost:4000

        Your new password is: new_password

        Best regards,
        University of Helsinki, Digital and Computational Methods
        """).strip()
    assert call_args[2].strip() == expected_content

@pytest.mark.usefixtures("setup_and_teardown")
@patch('src.utils.mail_dispatcher.smtplib.SMTP')
def test_send_email_success(mock_smtp, app, caplog):
    """Test successful email sending."""
    mock_smtp.return_value.__enter__.return_value = Mock()

    with app.app_context():
        original_smtp_sender = app.config['SMTP_SENDER']
        app.config['SMTP_SENDER'] = 'test@example.com'
        with caplog.at_level(logging.INFO):
            send_email('test@test.com', 'Test Subject', 'Test Body')
        app.config['SMTP_SENDER'] = original_smtp_sender

    assert "Successfully sent email to test@test.com" in caplog.text

@pytest.mark.usefixtures("setup_and_teardown")
@patch('src.utils.mail_dispatcher.smtplib.SMTP')
def test_send_email_failure(mock_smtp, app, caplog):
    """Test email sending failure."""
    mock_smtp.return_value.__enter__.return_value.send_message.side_effect = (
        SMTPException('Test error')
    )

    with app.app_context():
        original_smtp_sender = app.config['SMTP_SENDER']
        app.config['SMTP_SENDER'] = 'test@example.com'
        with caplog.at_level(logging.ERROR):
            with pytest.raises(SMTPException):
                send_email('test@test.com', 'Test Subject', 'Test Body')
        app.config['SMTP_SENDER'] = original_smtp_sender

    assert "Error: unable to send email to test@test.com. Test error" in caplog.text

@pytest.mark.usefixtures("setup_and_teardown")
def test_send_email_no_smtp_sender(app, caplog):
    """Test email sending when SMTP_SENDER is not set."""
    with app.app_context():
        original_smtp_sender = app.config['SMTP_SENDER']
        app.config['SMTP_SENDER'] = None
        with caplog.at_level(logging.WARNING):
            send_email('test@test.com', 'Test Subject', 'Test Body')
        app.config['SMTP_SENDER'] = original_smtp_sender

    assert "SMTP_SENDER not set. Skipping email send." in caplog.text
