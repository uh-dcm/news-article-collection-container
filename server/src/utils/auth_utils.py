"""
This handles utils related to authentication and user data.
"""
import os
import json
from functools import wraps
from flask import current_app
from flask_jwt_extended import jwt_required

def jwt_required_conditional(fn):
    """Authentication wrapper function for routes. Used by routes.py."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # allow requests without token in testing (only for pytest) environment
        if current_app.config['TESTING']:
            return fn(*args, **kwargs)
        else:
            return jwt_required()(fn)(*args, **kwargs)
    return wrapper

def get_user_data():
    """
    Getting user data from the user data file.
    Used by many functions in user_management.py and reregistration.py.
    """
    file_path = os.path.join(current_app.config['FETCHER_FOLDER'], 'data', 'user.json')
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def set_user_data(data):
    """
    Saving user data to the data folder in user file.
    Used by user_management.register().
    """
    file_path = os.path.join(current_app.config['FETCHER_FOLDER'], 'data', 'user.json')
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f)
