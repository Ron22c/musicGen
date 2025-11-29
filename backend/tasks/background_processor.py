import threading
import os
from services.music_generator import MusicGenerator
from services.storage import StorageService
from services.database import DatabaseService
from models import SongStatus
from datetime import datetime


class BackgroundTaskProcessor:
    @staticmethod
    def process_song_generation(song_id: str):
        def task():
            db = DatabaseService()
            
            try:
                song_result = db.select("songs").eq("id", song_id).execute()
                
                if not song_result.data:
                    return
                
                song = song_result.data[0]
                
                db.update("songs", {
                    "status": SongStatus.PROCESSING.value,
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", song_id).execute()
                
                generator = MusicGenerator()
                audio_file_path = generator.generate(song["prompt"], song["max_tokens"])
                
                storage = StorageService()
                blob_name = f"{song_id}.wav"
                gcs_url = storage.upload_file(audio_file_path, blob_name)
                
                os.remove(audio_file_path)
                
                db.update("songs", {
                    "status": SongStatus.COMPLETED.value,
                    "gcs_url": gcs_url,
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", song_id).execute()
                
            except Exception as exc:
                db.update("songs", {
                    "status": SongStatus.FAILED.value,
                    "error_message": str(exc),
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", song_id).execute()
        
        thread = threading.Thread(target=task, daemon=True)
        thread.start()
