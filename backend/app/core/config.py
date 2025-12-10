from pydantic_settings import BaseSettings
from pydantic import Field, model_validator
from functools import lru_cache
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str = Field(default="")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin
    ADMIN_PASSWORD: str = Field(default="")
    ADMIN_USERNAME: str = Field(default="admin")
    
    # Supabase (optional for now)
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_KEY: str = "example-key"
    
    # Redis (optional for production)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    FRONTEND_URL: str = "https://wiltordichingwa.vercel.app"
    ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: [
        "https://wiltordichingwa.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ])
    
    # File Upload
    UPLOAD_DIR: str = "uploads/writeups"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60
    
    # hCaptcha
    HCAPTCHA_SECRET_KEY: str = Field(default="")
    HCAPTCHA_SITE_KEY: str = Field(default="")
    
    class Config:
        env_file = ".env"
    
    @model_validator(mode="after")
    def validate_secrets(self):
        """Validate that required secrets are set in production"""
        is_development = os.getenv("ENVIRONMENT", "development") == "development"
        
        if not is_development:
            # In production, these MUST be set via environment variables
            if not self.SECRET_KEY or self.SECRET_KEY == "":
                raise ValueError(
                    "SECRET_KEY must be set via environment variable in production"
                )
            if not self.ADMIN_PASSWORD or self.ADMIN_PASSWORD == "":
                raise ValueError(
                    "ADMIN_PASSWORD must be set via environment variable in production"
                )
        else:
            # In development, provide sensible defaults only if not set
            if not self.SECRET_KEY or self.SECRET_KEY == "":
                self.SECRET_KEY = "dev-secret-key-change-in-production"
            if not self.ADMIN_PASSWORD or self.ADMIN_PASSWORD == "":
                self.ADMIN_PASSWORD = "admin123"
        
        return self

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
