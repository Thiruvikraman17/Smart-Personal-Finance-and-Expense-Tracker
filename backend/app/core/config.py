import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Personal Finance & Expense Tracker"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SUPER_SECRET_JWT_KEY_SMART_FINANCE_TRACKER_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30 # 30 days
    
    # Database configuration (Defaults to SQLite for instant local runs if PostgreSQL is not active)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./smart_finance.db"
    )

    class Config:
        case_sensitive = True

settings = Settings()
