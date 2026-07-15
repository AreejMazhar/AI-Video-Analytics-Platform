from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Invexal AI Video Analytics"
    DEBUG: bool = True
    
    # Database - This will read from .env
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS - Allow frontend
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # AI Models
    MODEL_PATH: str = "./models"
    CONFIDENCE_THRESHOLD: float = 0.5
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()