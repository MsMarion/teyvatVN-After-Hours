"""
Main Application Entry Point

This file is the "heart" of our backend server.
It sets up the FastAPI application, which is the framework we use to build our API.

Its main jobs are:
1.  **Initialization**: Creating the 'app' object that runs everything.
2.  **Database Setup**: Making sure our database tables exist.
3.  **CORS**: Allowing our Frontend (React) to talk to this Backend (Python).
4.  **Routing**: Connecting different parts of the API (Auth, Story, AI) to the main app.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import FRONTEND_URL, BACKEND_URL, ALLOWED_ORIGINS

# Import our database connection and models
from app.core.database import engine, Base
# Import our API routers (groups of related endpoints)
from app.routers import auth, story, ai



# --- Database Initialization ---
# This line looks at all our Python data models (in app/models/sql.py)
# and creates the corresponding tables in the database if they don't exist yet.
# Note: In a big professional project, we would use a tool called "Alembic" for this,
# but this is perfect for getting started.
Base.metadata.create_all(bind=engine)

# --- FastAPI App Setup ---
app = FastAPI(
    title="TeyvatVN Backend",
    description="Backend API for TeyvatVN Visual Novel",
    version="1.0.0"
)

# --- CORS Configuration ---
# CORS (Cross-Origin Resource Sharing) is a security feature in browsers.
# By default, a website on port 3000 (Frontend) can't talk to a server on port 8000 (Backend).
# We need to explicitly tell the browser: "It's okay, trust requests from these URLs."



# Configure CORS (Cross-Origin Resource Sharing)
# This allows the frontend application to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    # allow_origins: List of URLs that are allowed to talk to this API.
    allow_origins=ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"], # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allow all headers (like Authorization tokens)
)

# --- Static File Serving ---
# We want to be able to serve images or other files directly from a folder.
# This sets up the '/data' URL path to point to our local 'data' folder.

# 1. Find the absolute path to the 'data' folder
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
# 2. Create it if it doesn't exist
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# 3. Mount it to the app
# Now, a file at 'backend/data/image.png' can be accessed at 'http://localhost:8000/data/image.png'
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

# --- Router Registration ---
# We keep our code organized by splitting it into different files ("routers").
# Here, we plug them all into the main app.
app.include_router(auth.router)  # Handles Login, Register, Google Auth
app.include_router(story.router) # Handles Saving/Loading Stories
app.include_router(ai.router)    # Handles AI Generation requests

# --- Development Server ---
# This block only runs if you execute this file directly (python main.py).
# Usually, we run it via the terminal command 'uvicorn app.main:app --reload'.
if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
