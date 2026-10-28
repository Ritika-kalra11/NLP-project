"""
ResearchAI Configuration Settings.
Loads environment variables using Pydantic Settings with robust absolute path resolution.
"""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Absolute Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
DATA_DIR = ROOT_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
VECTOR_DB_DIR = DATA_DIR / "vector_db"

# Ensure data directories exist
DATA_DIR.mkdir(exist_ok=True, parents=True)
UPLOADS_DIR.mkdir(exist_ok=True, parents=True)
VECTOR_DB_DIR.mkdir(exist_ok=True, parents=True)


class Settings(BaseSettings):
    """Application configuration settings."""

    RESEARCHAI_ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # Demo Mode
    DEMO_MODE: bool = True

    # LLM Settings
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    TEMPERATURE: float = 0.2
    MAX_TOKENS: int = 2048

    # Embedding Settings
    EMBEDDING_PROVIDER: str = "local-tfidf"  # local-tfidf, sentence-transformers, openai
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DB_DIR: str = str(VECTOR_DB_DIR)

    # Database & Storage (Guaranteed absolute paths)
    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'researchai.db'}"
    UPLOAD_DIR: str = str(UPLOADS_DIR)
    MAX_FILE_SIZE_MB: int = 50

    # RAG Pipeline Hyperparameters
    TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.20
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 100
    USE_HYBRID_SEARCH: bool = True
    USE_RERANKING: bool = True

    @property
    def cors_origin_list(self) -> List[str]:
        """Return CORS origins as a list of strings."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "allow"


settings = Settings()

# Enforce absolute canonical paths
settings.UPLOAD_DIR = str(UPLOADS_DIR.resolve())
settings.VECTOR_DB_DIR = str(VECTOR_DB_DIR.resolve())
settings.DATABASE_URL = f"sqlite:///{str((DATA_DIR / 'researchai.db').resolve())}"
