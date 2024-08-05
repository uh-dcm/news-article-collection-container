"""
This handles utils related to authentication, namely the jwt wrapper.
"""
from functools import wraps
from flask import current_app, jsonify
from flask_jwt_extended import verify_jwt_in_request

def jwt_required_conditional(fn):
    """Authentication wrapper function for routes. Used by routes.py."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if current_app.config['TESTING']:
            return fn(*args, **kwargs)
        else:
            try:
                verify_jwt_in_request()
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify(
                    {"valid": False, "message": f"Error in jwt_required_conditional: {str(e)}"}
                ), 401
    return wrapper

def validate_token():
    """Authorization token validation. Used by the get_is_valid_token route."""
    try:
        verify_jwt_in_request()
        return jsonify({"valid": True}), 200
    except Exception as e:
        return jsonify({"valid": False, "message": f"Error in validate_token: {str(e)}"}), 401
