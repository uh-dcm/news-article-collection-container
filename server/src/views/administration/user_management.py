"""
Handles register and login routes. Called by routes.py.
"""
import os
from flask import jsonify, request, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token

from itsdangerous import URLSafeTimedSerializer as Serializer, BadSignature, SignatureExpired

def get_password_file_path():
    """
    Shared file path get function for the actual route functions. It's a function
    instead of a shared variable so the folder isn't checked before it's created.
    """
    return os.path.join(current_app.config['FETCHER_FOLDER'], 'data', 'password.txt')

def get_email_file_path():
    """
    Shared file path get function for the actual route functions. It's a function
    instead of a shared variable so the folder isn't checked before it's created.
    """
    return os.path.join(current_app.config['FETCHER_FOLDER'], 'data', 'email.txt')

def register():
    """Register a new user. Called by routes.init_routes() for route /api/register."""
    password_file_path = get_password_file_path()
    email_file_path = get_email_file_path()

    if current_app.config['TESTING']:
        with open(password_file_path, 'w', encoding='utf-8') as f:
            f.write(generate_password_hash("testpassword"))
        with open(email_file_path, 'w', encoding='utf-8') as f:
            f.write("testemail")
        return jsonify({"msg": "User created"}), 200

    password = request.json.get('password', None)
    email_address = request.json.get('email', None)

    if not password or not email_address:
        return jsonify({"msg": "Missing username or password"}), 400

    hashed_password = generate_password_hash(password)

    # use a basic file for now (or maybe forever if it's good enough)
    if os.path.exists(password_file_path):
        return jsonify({"msg": "User already exists"}), 409

    with open(password_file_path, 'w', encoding='utf-8') as f:
        f.write(hashed_password)
    
    with open(email_file_path, 'w', encoding='utf-8') as f:
        f.write(email_address)

    return jsonify({"msg": "User created"}), 200

def login():
    """Login a user. Called by routes.init_routes() for route /api/login."""
    password_file_path = get_password_file_path()

    password = request.json.get('password', None)

    if not password:
        return jsonify({"msg": "Missing username or password"}), 400

    if not os.path.exists(password_file_path):
        return jsonify({"msg": "User does not exist"}), 404

    with open(password_file_path, 'r', encoding='utf-8') as f:
        hashed_password = f.read()

    if not check_password_hash(hashed_password, password):
        return jsonify({"msg": "Invalid username or password"}), 401

    access_token = create_access_token(identity='admin')
    return jsonify(access_token=access_token), 200

def get_user_exists():
    """
    Check if the user exists.
    Called by routes.init_routes() for route /api/get_user_exists.
    """
    password_file_path = get_password_file_path()
    return jsonify({"exists": os.path.exists(password_file_path)}), 200

def generate_password_reset_link(webpage: str):
    """
    Generate a password reset link.
    """

    if webpage[-1] != "/":
        webpage += "/"

    serializer = Serializer(current_app.config['SECRET_KEY'], salt='reset-password') # salt is not needed, but it's good practice

    token = serializer.dumps('user-password-reset')

    reset_password_link = f"{webpage}?token={token}"

    return reset_password_link

def send_reset_password_link():
    """
    Send a reset password link to the user.
    Called by routes.init_routes() for route /api/send_reset_password_link.
    """
    webpage = request.json.get('webpage', None)

    if not webpage:
        return jsonify({"msg": "Missing webpage"}), 400

    try:
        reset_password_link = generate_password_reset_link(webpage)
        print("reset password link:", reset_password_link) # TODO: remove this after email is implemented
    except:
        return jsonify({"msg": "Error generating password reset link"}), 500

    # TODO: send email with link

    return jsonify({"msg": "Reset email sent successfully"}), 200

def check_valid_token(token):
    """
    Check if the token is valid.
    """
    if not token:
        return jsonify({"msg": "Missing token"}), 400

    serializer = Serializer(current_app.config['SECRET_KEY'], salt='reset-password') # salt is not needed, but it's good practice
    # the reason salt is not needed is because the token is already unique (this app currently does not have other token use cases that could collide)

    try:
        token_type = serializer.loads(token, max_age=3600) # 1 hour
        if token_type != 'user-password-reset':
            return "Token not valid for this use case", False
    except SignatureExpired:
        return "Token expired", False
    except BadSignature:
        return "Token invalid, possibly tampered with", False
    except: # TODO: catch specific?
        return "Unknown error", False

    return "Valid token", True

def reset_password():
    """
    Reset the password.
    Called by routes.init_routes() for route /api/reset_password.
    """
    password_file_path = get_password_file_path()

    password = request.json.get('password', None)

    # first check if the reset token is valid
    token = request.json.get('reset_token', None)

    if not password:
        return jsonify({"msg": "Missing password"}), 400

    if not token:
        return jsonify({"msg": "Missing token"}), 400
    

    token_check_message, valid_token = check_valid_token(token)

    if not valid_token:
        return jsonify({"msg": token_check_message}), 400

    hashed_password = generate_password_hash(password)

    try:
        with open(password_file_path, 'w', encoding='utf-8') as f:
            f.write(hashed_password)
    except:
        return jsonify({"msg": "Error resetting password"}), 500

    return jsonify({"msg": "Password reset successful"}), 200