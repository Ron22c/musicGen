from config import get_settings
import os
from pathlib import Path
from datetime import timedelta


class StorageService:
    def __init__(self):
        self.settings = get_settings()
        
        if self.settings.use_local_storage:
            self.local_mode = True
            os.makedirs(self.settings.local_storage_path, exist_ok=True)
            self.client = None
            self.bucket = None
        else:
            self.local_mode = False
            from google.cloud import storage
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.settings.google_application_credentials
            self.client = storage.Client(project=self.settings.gcs_project_id)
            self.bucket = self.client.bucket(self.settings.gcs_bucket_name)
    
    def upload_file(self, source_path: str, destination_blob_name: str) -> str:
        if self.local_mode:
            dest_path = os.path.join(self.settings.local_storage_path, destination_blob_name)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            import shutil
            shutil.copy2(source_path, dest_path)
            
            return f"/storage/{destination_blob_name}"
        else:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_filename(source_path)
            blob.make_public()
            return blob.public_url
    
    def upload_from_bytes(self, data: bytes, destination_blob_name: str, content_type: str = "audio/wav") -> str:
        if self.local_mode:
            dest_path = os.path.join(self.settings.local_storage_path, destination_blob_name)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            with open(dest_path, 'wb') as f:
                f.write(data)
            
            return f"/storage/{destination_blob_name}"
        else:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_string(data, content_type=content_type)
            blob.make_public()
            return blob.public_url
    
    def delete_file(self, blob_name: str) -> None:
        if self.local_mode:
            file_path = os.path.join(self.settings.local_storage_path, blob_name)
            if os.path.exists(file_path):
                os.remove(file_path)
        else:
            blob = self.bucket.blob(blob_name)
            blob.delete()
    
    def get_signed_url(self, blob_name: str, expiration: int = 3600) -> str:
        if self.local_mode:
            return f"/storage/{blob_name}"
        else:
            blob = self.bucket.blob(blob_name)
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=expiration),
                method="GET"
            )
            return url
