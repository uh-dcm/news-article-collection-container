"""
Handles user detail reregistration functionality. Called by routes.py.
"""
from flask import jsonify, request, current_app
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from src.utils.auth_utils import get_user_data
from src.utils.mail_dispatcher import send_reregister_request_email

def request_reregister():
    """
    Request reregistration for reregistering user details. Doesn't affect database.
    Called by routes.init_routes() for route /api/request_reregister.
    """
    user_data = get_user_data()
    if not user_data:
        return jsonify({"msg": "User does not exist"}), 404

    # generating token
    serializer = URLSafeTimedSerializer(current_app.config['REREGISTER_SECRET_KEY'])
    token = serializer.dumps(user_data['email'])

    # the reregister link
    reregister_link = f"{request.host_url}reregister/{token}"

    response = {
        "msg": "Reregistration link generated",
    }

    # negates out testing and development when there is not SMTP_SENDER
    if not current_app.config['TESTING'] and current_app.config['SMTP_SENDER']:
        try:
            send_reregister_request_email(request.host_url, user_data['email'], reregister_link)
            response["email_sent"] = True
        except Exception as e:
            current_app.logger.error(f"Failed to send reregistration email: {str(e)}")
            response["email_sent"] = False
            response["email_error"] = "Failed to send reregistration email"
    else:
        # for testing and development when SMTP_SENDER is not set
        current_app.logger.info(f"REREGISTRATION LINK (for development only): {reregister_link}")
        response["reregister_link"] = reregister_link

    return jsonify(response), 200

def validate_reregister_token(token):
    """
    Reregister token validification including expiration.
    Called by routes.init_routes() for route /api/validate_reregister_token/-token-.
    """
    serializer = URLSafeTimedSerializer(current_app.config['REREGISTER_SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            max_age=current_app.config['REREGISTER_TOKEN_EXPIRES']
        )
        return jsonify({"valid": True, "email": email}), 200
    except (SignatureExpired, BadSignature):
        return jsonify({"valid": False}), 400
