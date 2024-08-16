"""
Configures settings for gmail, creates and sends email.
"""
import smtplib
import ssl
from email.message import EmailMessage
from flask import current_app
from src.config import Config

SMTP_SERVER = 'smtp.pouta.csc.fi'
SMTP_PORT = 25
SERVER_EMAIL = Config.MAIL_SENDER

# Create a single SSL context for reuse
ssl_context = ssl.create_default_context()

def create_email(host_url, password, username):
    """
    Creates email...
    """
    subject = 'Password for the News Article Collector'
    body = f'Here is your password ({password}) for the app ({host_url})'

    em = EmailMessage()
    em['From'] = SERVER_EMAIL
    em['To'] = username
    em['Subject'] = subject
    em.set_content(body)

    return em

def send_email(request):
    """
    Sends email with SMTP-server and SSL.
    """
    host_url = request.host_url
    password = request.json.get('password', None)
    username = request.json.get('email', None)
    email_message = create_email(host_url, password, username)

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=ssl_context) as smtp:
            smtp.sendmail(SERVER_EMAIL, username, email_message.as_string())
    except smtplib.SMTPAuthenticationError:
        msg = 'Authentication to the email server failed'
        current_app.logger.error(msg)
        return msg
    except smtplib.SMTPConnectError:
        msg = 'Connection to the email server failed'
        current_app.logger.error(msg)
        return msg
    except Exception:
        msg = 'Failed to send email for an unknown reason'
        current_app.logger.error(msg)
        return msg

    return 'Email sent successfully'
