"""
Handles user detail reregistration functionality. Called by routes.py.
"""
from flask import jsonify, request, current_app
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from src.utils.auth_utils import get_user_data
#from src.views.administration.mail_dispatcher import send_email

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
    token = serializer.dumps(user_data['email'], salt=current_app.config['REREGISTER_SALT'])

    # the reregister link
    reregister_link = f"{request.host_url}reregister/{token}"

    # TODO: remove these in prod, enable parts commented out at bottom, enable import
    # link to terminal; in prod remove this, also remove part in authfunctions.tsx
    current_app.logger.info(f"REREGISTRATION LINK (for development only): {reregister_link}")
    # development version to be simply shown in console; remove in prod
    return jsonify({
        "msg": "Reregistration link sent",
        "reregister_link": reregister_link
    }), 200

    # email details
    #subject = "Reregister User Details for News Article Collector"
    #body = f"Click the following link to reregister your user details: {reregister_link}"

    #try:
        #if not current_app.config['TESTING']:
        #    send_email(user_data['email'], subject, body)
        #return jsonify({"msg": "Reregistration link sent"}), 200
    #except Exception as e:
    #    current_app.logger.error(f"Failed to send reregistration email: {str(e)}")
    #    return jsonify({"msg": "Failed to send reregistration email"}), 500

def validate_reregister_token(token):
    """
    Reregister token validification including expiration.
    Called by routes.init_routes() for route /api/validate_reregister_token/-token-.
    """
    serializer = URLSafeTimedSerializer(current_app.config['REREGISTER_SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['REREGISTER_SALT'],
            max_age=current_app.config['REREGISTER_EXPIRATION']
        )
        return jsonify({"valid": True, "email": email}), 200
    except (SignatureExpired, BadSignature):
        return jsonify({"valid": False}), 400
