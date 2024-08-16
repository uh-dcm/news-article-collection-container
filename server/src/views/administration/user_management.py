"""
Handles register and login routes. Called by routes.py.
"""
from flask import current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token

from src.config import Config
from src.utils.auth_utils import get_user_data, set_user_data
from src.views.administration.mail_dispatcher import send_email

def register():
    """
    Register a new user. Checks isReregistering whether to allow registering again.
    Called by routes.init_routes() for route /api/register.
    """
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    is_reregistering = request.json.get('isReregistering', False)

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    existing_user = get_user_data()
    if existing_user and not is_reregistering:
        return jsonify({"msg": "User already exists"}), 409

    new_user_data = {"email": email, "password": generate_password_hash(password)}
    set_user_data(new_user_data)

    if not current_app.config['TESTING'] and Config.MAIL_SENDER is not None:
        send_email(request)

    if is_reregistering:
        return jsonify({"msg": "User updated"}), 200
    else:
        return jsonify({"msg": "User created"}), 200

def login():
    """Login a user. Called by routes.init_routes() for route /api/login."""
    password = request.json.get('password', None)
    if not password:
        return jsonify({"msg": "Missing password"}), 400

    user_data = get_user_data()
    if not user_data:
        return jsonify({"msg": "User does not exist"}), 404

    if not check_password_hash(user_data['password'], password):
        return jsonify({"msg": "Invalid password"}), 401

    access_token = create_access_token(identity=user_data['email'])
    return jsonify(access_token=access_token), 200
