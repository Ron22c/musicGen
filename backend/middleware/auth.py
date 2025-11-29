from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from services.auth import AuthService


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            
            auth_service = AuthService()
            user = auth_service.get_user_by_id(current_user_id)
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return fn(current_user_id, *args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 401
    
    return wrapper
