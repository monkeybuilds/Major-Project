import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Database — PostgreSQL (primary) or SQLite (fallback)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Atharv%40125@localhost:5432/gyan_vault",
)

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "gyan-vault-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# File uploads
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Vector store
VECTOR_STORE_DIR = BASE_DIR / "vector_stores"
VECTOR_STORE_DIR.mkdir(exist_ok=True)

# Embedding model
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Chunking
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# Google Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
LLM_MODEL_NAME = "gemini-2.0-flash"
