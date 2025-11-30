"""
Main application entry point.

This module initializes the FastAPI application, sets up middleware (CORS),
mounts static files, and includes the API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.core.database import engine, Base
from app.routers import auth, story, ai

# Load environment variables from .env file
load_dotenv()

# Create database tables based on the defined models
# This is a simple way to initialize the DB. For production, use Alembic migrations.
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(
    title="TeyvatVN Backend",
    description="Backend API for TeyvatVN Visual Novel",
    version="1.0.0"
)

# Load environment variables for CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:6001")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:6002")

# Configure CORS (Cross-Origin Resource Sharing)
# This allows the frontend application to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://updates-limitations-favors-effectively.trycloudflare.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the /data directory for direct file access (e.g., for serving images or assets)
# We determine the absolute path to the 'data' directory relative to this file.
# app/main.py -> backend_server/app/main.py. data is in backend_server/data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Mount the static files directory
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

# Include API routers
app.include_router(auth.router)
app.include_router(story.router)
app.include_router(ai.router)

if __name__ == "__main__":
    # Run the application using uvicorn if executed directly
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
