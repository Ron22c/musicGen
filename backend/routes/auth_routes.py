from flask import Blueprint, request, jsonify
from models import UserCreate, UserLogin, UserUpdate
from services.auth import AuthService
from middleware import require_auth
from flask_jwt_extended import get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
auth_service = AuthService()


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        user_data = UserCreate(**data)
        user = auth_service.create_user(user_data)
        
        return jsonify({
            "message": "User created successfully",
            "user": user.model_dump()
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        login_data = UserLogin(**data)
        user, access_token, refresh_token = auth_service.authenticate_user(login_data)
        
        return jsonify({
            "message": "Login successful",
            "user": user.model_dump(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_current_user(current_user_id):
    try:
        user = auth_service.get_user_by_id(current_user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({"user": user.model_dump()}), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/me", methods=["PUT"])
@require_auth
def update_current_user(current_user_id):
    try:
        data = request.get_json()
        update_data = UserUpdate(**data)
        
        user = auth_service.update_user(
            current_user_id,
            update_data.model_dump(exclude_unset=True)
        )
        
        return jsonify({
            "message": "User updated successfully",
            "user": user.model_dump()
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
