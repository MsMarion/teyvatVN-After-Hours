from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.core.database import engine, Base
from app.routers import auth, story, ai

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Load environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:6001")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:6002")

# Allow frontend to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://updates-limitations-favors-effectively.trycloudflare.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the /data directory for direct file access
# We need to find the data dir relative to this file or use absolute path
# app/main.py -> backend_server/app/main.py. data is in backend_server/data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

app.include_router(auth.router)
app.include_router(story.router)
app.include_router(ai.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
