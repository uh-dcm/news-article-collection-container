"""
Handles register and login. Called by app.py.
"""
import os
from flask import jsonify, request, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token

def register():
    """
    Register a new user. Called by app.register_route().
    """
    password_file_path = f"./{current_app.config['FETCHER_FOLDER']}/data/password.txt"

    if current_app.config['TESTING']:
        with open(password_file_path, 'w', encoding='utf-8') as f:
            f.write(generate_password_hash("testpassword"))
        return jsonify({"msg": "User created"}), 200

    password = request.json.get('password', None)

    if not password:
        return jsonify({"msg": "Missing username or password"}), 400

    hashed_password = generate_password_hash(password)

    # use a basic file for now
    if os.path.exists(password_file_path):
        return jsonify({"msg": "User already exists"}), 409

    with open(password_file_path, 'w', encoding='utf-8') as f:
        f.write(hashed_password)

    return jsonify({"msg": "User created"}), 200

def login():
    """
    Login a user. Called by app.login_route().
    """
    password_file_path = f"./{current_app.config['FETCHER_FOLDER']}/data/password.txt"

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
    Check if the user exists. Called by app.get_user_exists_route().
    """
    password_file_path = f"./{current_app.config['FETCHER_FOLDER']}/data/password.txt"
    return jsonify({"exists": os.path.exists(password_file_path)}), 200
