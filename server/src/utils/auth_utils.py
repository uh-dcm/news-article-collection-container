"""
This handles utils related to authentication, namely the jwt wrapper.
"""
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
