from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    flask_env: str = "development"
    secret_key: str
    jwt_secret_key: str
    
    supabase_url: str
    supabase_key: str
    
    gcs_bucket_name: Optional[str] = None
    gcs_project_id: Optional[str] = None
    google_application_credentials: Optional[str] = None
    use_local_storage: bool = True
    local_storage_path: str = str(Path(__file__).parent / "storage" / "songs")
    
    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    stripe_price_id: Optional[str] = None
    stripe_enabled: bool = False
    
    free_user_max_tokens: int = 256
    paid_user_max_tokens: int = 2048
    max_configurable_tokens: int = 4096
    
    hf_home: str = "./models"
    
    class Config:
        # Use absolute path to .env file relative to this config.py file
        env_file = str(Path(__file__).parent / ".env")
        case_sensitive = False
    
    def is_gcs_configured(self) -> bool:
        return bool(
            self.gcs_bucket_name and 
            self.gcs_project_id and 
            self.google_application_credentials
        )
    
    def is_stripe_configured(self) -> bool:
        return bool(
            self.stripe_secret_key and 
            self.stripe_publishable_key and 
            self.stripe_price_id
        )


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.use_local_storage = not settings.is_gcs_configured()
    settings.stripe_enabled = settings.is_stripe_configured()
    return settings
