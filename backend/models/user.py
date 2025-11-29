from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    is_paid: bool = False
    stripe_customer_id: Optional[str] = None
    max_tokens: int = 256
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_paid: bool
    max_tokens: int
    created_at: datetime
