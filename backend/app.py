import os
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import get_settings
from routes import auth_bp, song_bp, payment_bp
from pathlib import Path


def create_app():
    app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
    
    settings = get_settings()
    
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["JWT_SECRET_KEY"] = settings.jwt_secret_key
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    JWTManager(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(song_bp)
    app.register_blueprint(payment_bp)
    
    @app.route("/")
    @app.route("/<path:path>")
    def serve_react_app(path=""):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")
    
    @app.route("/health")
    def health_check():
        return {
            "status": "healthy",
            "storage": "local" if settings.use_local_storage else "gcs",
            "payment": "enabled" if settings.stripe_enabled else "disabled"
        }, 200
    
    @app.route("/storage/<path:filepath>")
    def serve_storage(filepath):
        storage_path = Path(settings.local_storage_path)
        file_path = storage_path / filepath

        if file_path.is_file():
            return send_file(file_path, mimetype="audio/wav")
        return {"error": "File not found", "path": str(file_path)}, 404
    
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=80, debug=True)
