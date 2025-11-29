from flask import Blueprint, request, jsonify
from services.payment import PaymentService
from middleware import require_auth
from config import get_settings

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")
payment_service = PaymentService()
settings = get_settings()


@payment_bp.route("/create-checkout-session", methods=["POST"])
@require_auth
def create_checkout_session(current_user_id):
    try:
        data = request.get_json()
        success_url = data.get("success_url", "http://localhost:3000/payment/success")
        cancel_url = data.get("cancel_url", "http://localhost:3000/payment/cancel")
        
        session = payment_service.create_checkout_session(
            current_user_id,
            success_url,
            cancel_url
        )
        
        return jsonify(session), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@payment_bp.route("/webhook", methods=["POST"])
def stripe_webhook():
    try:
        payload = request.data
        sig_header = request.headers.get("Stripe-Signature")
        
        result = payment_service.handle_webhook(payload, sig_header)
        
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@payment_bp.route("/cancel-subscription", methods=["POST"])
@require_auth
def cancel_subscription(current_user_id):
    try:
        result = payment_service.cancel_subscription(current_user_id)
        
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@payment_bp.route("/config", methods=["GET"])
def get_stripe_config():
    return jsonify({
        "publishable_key": settings.stripe_publishable_key,
        "enabled": settings.stripe_enabled
    }), 200
