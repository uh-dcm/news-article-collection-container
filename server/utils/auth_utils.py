"""
Utils related to authentication.
"""
from functools import wraps
from flask import current_app
from flask_jwt_extended import jwt_required

def jwt_required_conditional(fn):
    """
    Authentication wrapper function for routes.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # allow requests without token in testing (only for pytest) environment
        if current_app.config['TESTING']:
            return fn(*args, **kwargs)
        else:
            return jwt_required()(fn)(*args, **kwargs)
    return wrapper
