import bcrypt
from typing import Optional
from datetime import datetime
from flask_jwt_extended import create_access_token, create_refresh_token
from models import User, UserCreate, UserLogin, UserResponse
from services.database import DatabaseService
from config import get_settings


class AuthService:
    def __init__(self):
        self.db = DatabaseService()
        self.settings = get_settings()
    
    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def create_user(self, user_data: UserCreate) -> UserResponse:
        existing = self.db.select("users").eq("email", user_data.email).execute()
        if existing.data:
            raise ValueError("User with this email already exists")
        
        password_hash = self.hash_password(user_data.password)
        
        user_dict = {
            "email": user_data.email,
            "password_hash": password_hash,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "is_paid": False,
            "max_tokens": self.settings.free_user_max_tokens,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        result = self.db.insert("users", user_dict)
        return UserResponse(**result.data[0])
    
    def authenticate_user(self, login_data: UserLogin) -> tuple[UserResponse, str, str]:
        result = self.db.select("users").eq("email", login_data.email).execute()
        
        if not result.data:
            raise ValueError("Invalid email or password")
        
        user_data = result.data[0]
        
        if not self.verify_password(login_data.password, user_data["password_hash"]):
            raise ValueError("Invalid email or password")
        
        user = UserResponse(**user_data)
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return user, access_token, refresh_token
    
    def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        result = self.db.select("users").eq("id", user_id).execute()
        
        if not result.data:
            return None
        
        return UserResponse(**result.data[0])
    
    def update_user(self, user_id: str, update_data: dict) -> UserResponse:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = self.db.update("users", update_data).eq("id", user_id).execute()
        
        if not result.data:
            raise ValueError("User not found")
        
        return UserResponse(**result.data[0])
    
    def upgrade_to_paid(self, user_id: str, stripe_customer_id: str) -> UserResponse:
        update_data = {
            "is_paid": True,
            "stripe_customer_id": stripe_customer_id,
            "max_tokens": self.settings.paid_user_max_tokens,
        }
        return self.update_user(user_id, update_data)
