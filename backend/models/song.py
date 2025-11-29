from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum


class SongStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Song(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    description: Optional[str] = None
    prompt: str
    max_tokens: int
    status: SongStatus = SongStatus.PENDING
    gcs_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SongCreate(BaseModel):
    title: str
    description: Optional[str] = None
    prompt: str
    max_tokens: Optional[int] = None


class SongUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class SongResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    prompt: str
    max_tokens: int
    status: SongStatus
    gcs_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
