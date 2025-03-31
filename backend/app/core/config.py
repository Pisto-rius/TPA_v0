import secrets
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, BaseSettings, validator
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./tpa_tool.db"
    
    # File storage
    UPLOAD_FOLDER: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100 MB
    
    # TPA Analysis settings
    DEFAULT_FREQUENCY_RANGE: dict = {"min": 20, "max": 2000}
    DEFAULT_FREQUENCY_RESOLUTION: int = 100
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

