"""
Service for sending emails. On Rahti, you only need a university email address
and the CSC SMTP_SERVER value, although the emails will be marked as "Unverified" when
received. There are three types of emails: welcome email, reregistration request email
and reregistration confirmation (second welcome) email. They are called upon individually
in administration routes and then all lastly use send_email() here.
"""
import re
import smtplib
from email.message import EmailMessage
from flask import current_app

SMTP_SERVER = 'smtp.pouta.csc.fi'
SMTP_PORT = 25

def is_valid_email(email):
    """
    Basic email validation just based on format. SMTP exceptions didn't work.
    """
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None

def send_email(to_email, subject, body):
    """Core helper function to send an email."""
    if not current_app.config['SMTP_SENDER']:
        current_app.logger.warning("SMTP_SENDER not set. Skipping email send.")
        return

    if not is_valid_email(to_email):
        current_app.logger.error(f"Invalid email address: {to_email}")
        raise ValueError(f"Invalid email address: {to_email}")

    msg = EmailMessage()
    msg['From'] = current_app.config['SMTP_SENDER']
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.set_content(body)

    # for some reason SMTP exceptions aren't triggered by bad email addresses with this in Rahti
    # tried all the specific SMTP exceptions separately too, and SMTPException should catch them
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp_obj:
            smtp_obj.send_message(msg)
        current_app.logger.info(f"Successfully sent email to {to_email}")
    except smtplib.SMTPException as e:
        current_app.logger.error(f"Error: unable to send email to {to_email}. {str(e)}")
        raise
    except Exception as e:
        current_app.logger.error(f"Unexpected error sending email to {to_email}: {str(e)}")
        raise

def send_welcome_email(request, password):
    """
    Creates and sends welcome email. Called by user_management.register().
    Sending the password over in plaintext is unsecure but PO specifically requested it.
    """
    host_url = request.host_url
    to_email = request.json.get('email')
    subject = "Welcome to using the UH-DCM News Article Collector"
    body = f"""
Hello and welcome to using the UH-DCM News Article Collector!

You can access the application at: {host_url}

Your password is: {password}

Best regards,
University of Helsinki, Digital and Computational Methods
    """
    send_email(to_email, subject, body)

def send_reregister_request_email(host_url, to_email, reregister_link):
    """
    Creates and sends reregister request email.
    Called by reregistration.request_reregister(), where it gets the email at.
    """
    subject = "Renew your UH-DCM News Article Collector user details"
    body = f"""
Hello UH-DCM News Article Collector user, we've received a request to renew your details at:
{host_url}

To complete the process and update your details, please use the following link:

{reregister_link}

Best regards,
University of Helsinki, Digital and Computational Methods
    """
    send_email(to_email, subject, body)

def send_reregister_confirmation_email(request, new_password):
    """
    Creates and sends reregister confirmation email with the new password.
    Called by user_management.register().
    """
    host_url = request.host_url
    to_email = request.json.get('email')
    subject = "Your UH-DCM News Article Collector user details have been updated"
    body = f"""
Hello UH-DCM News Article Collector user, your user details have been successfully updated.

You can access the application at: {host_url}

Your new password is: {new_password}

Best regards,
University of Helsinki, Digital and Computational Methods
    """
    send_email(to_email, subject, body)
