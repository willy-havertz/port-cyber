from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin
    ADMIN_PASSWORD: str = "admin123"
    
    # Supabase (optional for now)
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_KEY: str = "example-key"
    
    # Redis (optional for production)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    FRONTEND_URL: str = "https://wiltordichingwa.vercel.app"
    
    # File Upload
    UPLOAD_DIR: str = "uploads/writeups"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
