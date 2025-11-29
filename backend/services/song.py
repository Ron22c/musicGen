from typing import List, Optional, Dict
from datetime import datetime
from models import Song, SongCreate, SongUpdate, SongResponse, SongStatus
from services.database import DatabaseService
from services.auth import AuthService
from config import get_settings
import uuid
import os


class SongService:
    def __init__(self):
        self.db = DatabaseService()
        self.auth_service = AuthService()
        self.settings = get_settings()
    
    def create_song(self, user_id: str, song_data: SongCreate) -> SongResponse:
        user = self.auth_service.get_user_by_id(user_id)
        
        if not user:
            raise ValueError("User not found")
        
        max_tokens = song_data.max_tokens or user.max_tokens
        
        if user.is_paid:
            max_allowed = min(max_tokens, self.settings.max_configurable_tokens)
        else:
            max_allowed = self.settings.free_user_max_tokens
        
        song_dict = {
            "user_id": user_id,
            "title": song_data.title,
            "description": song_data.description,
            "prompt": song_data.prompt,
            "max_tokens": max_allowed,
            "status": SongStatus.PENDING.value,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        result = self.db.insert("songs", song_dict)
        song = SongResponse(**result.data[0])
        
        from tasks.background_processor import BackgroundTaskProcessor
        BackgroundTaskProcessor.process_song_generation(song.id)
        
        return song
    
    def get_song(self, song_id: str, user_id: str) -> Optional[SongResponse]:
        result = self.db.select("songs").eq("id", song_id).eq("user_id", user_id).execute()
        
        if not result.data:
            return None
        
        return SongResponse(**result.data[0])
    
    def get_user_songs(self, user_id: str) -> List[SongResponse]:
        result = self.db.select("songs").eq("user_id", user_id).order("created_at", desc=True).execute()
        return [SongResponse(**song) for song in result.data]
    
    def update_song(self, song_id: str, user_id: str, update_data: SongUpdate) -> SongResponse:
        update_dict = update_data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow().isoformat()
        
        result = self.db.update("songs", update_dict).eq("id", song_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise ValueError("Song not found")
        
        return SongResponse(**result.data[0])
    
    def delete_song(self, song_id: str, user_id: str) -> None:
        song = self.get_song(song_id, user_id)
        
        if not song:
            raise ValueError("Song not found")
        
        if song.gcs_url:
            from services.storage import StorageService
            storage = StorageService()
            blob_name = song.gcs_url.split("/")[-1]
            try:
                storage.delete_file(blob_name)
            except Exception:
                pass
        
        self.db.delete("songs").eq("id", song_id).eq("user_id", user_id).execute()
    
    def update_song_status(self, song_id: str, status: SongStatus, gcs_url: Optional[str] = None, error_message: Optional[str] = None) -> SongResponse:
        update_dict = {
            "status": status.value,
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        if gcs_url:
            update_dict["gcs_url"] = gcs_url
        
        if error_message:
            update_dict["error_message"] = error_message
        
        result = self.db.update("songs", update_dict).eq("id", song_id).execute()
        
        if not result.data:
            raise ValueError("Song not found")
        
        return SongResponse(**result.data[0])
    
    def generate_anonymous_song(self, prompt: str) -> Dict[str, str]:
        """Generate a song for anonymous users without saving to database.
        
        Args:
            prompt: The text prompt for song generation
            
        Returns:
            Dict with download_url and song_id
        """
        from services.music_generator import MusicGenerator
        from services.storage import StorageService
        
        # Use free tier limits for anonymous users
        max_tokens = self.settings.free_user_max_tokens
        
        # Generate unique ID for this song
        song_id = str(uuid.uuid4())
        
        # Generate the song
        generator = MusicGenerator()
        audio_file_path = generator.generate(prompt, max_tokens)
        
        # Upload to storage
        storage = StorageService()
        blob_name = f"anonymous/{song_id}.wav"
        download_url = storage.upload_file(audio_file_path, blob_name)
        
        # Clean up temp file
        os.remove(audio_file_path)
        
        return {
            "download_url": download_url,
            "song_id": song_id
        }
