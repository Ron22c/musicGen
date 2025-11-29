from .auth_routes import auth_bp
from .song_routes import song_bp
from .payment_routes import payment_bp

__all__ = ["auth_bp", "song_bp", "payment_bp"]
