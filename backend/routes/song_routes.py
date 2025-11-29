from flask import Blueprint, request, jsonify
from models import SongCreate, SongUpdate
from services.song import SongService
from middleware import require_auth
import uuid

song_bp = Blueprint("songs", __name__, url_prefix="/api/songs")
song_service = SongService()


@song_bp.route("", methods=["POST"])
@require_auth
def create_song(current_user_id):
    try:
        data = request.get_json()
        song_data = SongCreate(**data)
        song = song_service.create_song(current_user_id, song_data)
        
        return jsonify({
            "message": "Song creation started",
            "song": song.model_dump()
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@song_bp.route("", methods=["GET"])
@require_auth
def get_user_songs(current_user_id):
    try:
        songs = song_service.get_user_songs(current_user_id)
        
        return jsonify({
            "songs": [song.model_dump() for song in songs]
        }), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@song_bp.route("/<song_id>", methods=["GET"])
@require_auth
def get_song(current_user_id, song_id):
    try:
        song = song_service.get_song(song_id, current_user_id)
        
        if not song:
            return jsonify({"error": "Song not found"}), 404
        
        return jsonify({"song": song.model_dump()}), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@song_bp.route("/<song_id>", methods=["PUT"])
@require_auth
def update_song(current_user_id, song_id):
    try:
        data = request.get_json()
        update_data = SongUpdate(**data)
        song = song_service.update_song(song_id, current_user_id, update_data)
        
        return jsonify({
            "message": "Song updated successfully",
            "song": song.model_dump()
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@song_bp.route("/<song_id>", methods=["DELETE"])
@require_auth
def delete_song(current_user_id, song_id):
    try:
        song_service.delete_song(song_id, current_user_id)
        
        return jsonify({"message": "Song deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@song_bp.route("/anonymous", methods=["POST"])
def create_anonymous_song():
    """Generate a song for anonymous users - no login required.
    Song is generated and returned immediately but not saved to any profile.
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or "prompt" not in data:
            return jsonify({"error": "Prompt is required"}), 400
        
        prompt = data.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "Prompt cannot be empty"}), 400
        
        # Generate song synchronously
        result = song_service.generate_anonymous_song(prompt)
        
        return jsonify({
            "message": "Song generated successfully",
            "download_url": result["download_url"],
            "song_id": result["song_id"]
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to generate song: {str(e)}"}), 500
