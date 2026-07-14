from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Invexal AI Video Analytics"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://invexal_user:invexal_password@localhost:5432/invexal_db"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # AI Models
    MODEL_PATH: str = "./models"
    CONFIDENCE_THRESHOLD: float = 0.5
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()