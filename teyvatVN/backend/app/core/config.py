import os
from dotenv import load_dotenv

load_dotenv()

# App URLs
print(f"DEBUG: Loading config.py. .env loaded? {load_dotenv()}")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:6001")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:6002")
print(f"DEBUG: Config BACKEND_URL: {BACKEND_URL}")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Security
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []
if not ALLOWED_ORIGINS:
    # Default fallback if not set
    ALLOWED_ORIGINS = [FRONTEND_URL, "https://updates-limitations-favors-effectively.trycloudflare.com"]

# AI Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

# Auth
SECRET_KEY = os.getenv("SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/google/callback"
