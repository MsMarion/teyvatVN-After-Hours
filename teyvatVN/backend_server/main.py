from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.responses import RedirectResponse
import os
import json
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse

# custom libs
import generate_ai_calls
import utils
import auth # Re-import auth
import google_auth # New import for Google OAuth2
from .database import get_db # Import get_db

app = FastAPI()

# Allow frontend to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:6001","https://updates-limitations-favors-effectively.trycloudflare.com", "*"],  # your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define where chapter data is stored
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Pydantic model for chapter data
class ChapterData(BaseModel):
    title: str
    characters: list[str]
    backgrounds: list[str]
    setting_narration: str
    segments: list[dict]


# Pydantic model for simplified generation request
class GenerateRequest(BaseModel):
    prompt: str
    username: str

# Pydantic model for auth
class AuthRequest(BaseModel):
    username: str
    password: str

# Helper: get path to output.json for a chapter
def get_chapter_path(username: str, chapter_id: str) -> str:
    folder = os.path.join(DATA_DIR, username, chapter_id)
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "output.json")

# --- AUTH ENDPOINTS ---

@app.get("/api/auth/google/login")
async def google_login():
    google_oauth_url = await google_auth.get_google_oauth_url()
    return RedirectResponse(google_oauth_url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    user_info = await google_auth.google_callback(code)
    email = user_info.get("email")
    name = user_info.get("name")

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google did not provide an email.")

    user = auth.get_user_by_email(db, email)
    if not user:
        # If user doesn't exist, create a new one with a dummy password
        # In a real app, you might want to prompt the user to set a password
        # or link their Google account to an existing account.
        # For now, we'll create a user with a generated password.
        # The username could be derived from email or name.
        username = email.split('@')[0] # Simple username from email
        # Check if username already exists, if so, append a number
        counter = 1
        original_username = username
        while auth.get_user(db, username):
            username = f"{original_username}{counter}"
            counter += 1

        user = auth.create_user(db, username=username, password=os.urandom(16).hex(), email=email)
        if not user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user.")

    # Here you would generate your own JWTs (access and refresh tokens)
    # For now, just return the user info and a dummy token
    return {"message": "Google login successful", "username": user.username, "token": "dummy-token-for-google-oauth"}

@app.post("/api/auth/register")
async def register(request: AuthRequest, db: Session = Depends(get_db)):
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    user = auth.create_user(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    return {"status": "success", "message": "User created"}

@app.post("/api/auth/login")
async def login(request: AuthRequest, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"status": "success", "username": user.username, "token": "dummy-token-for-mvp"}


# --- STORY ENDPOINTS ---

# API: Get chapter
@app.get("/api/chapter/{username}/{chapter_id}")
def get_chapter(username: str, chapter_id: str):
    # In a real app, we would validate the token here to ensure the requester is the user
    path = get_chapter_path(username, chapter_id)
    if not os.path.exists(path):
        return {"message": "Chapter not found", "data": None}
    with open(path, "r", encoding="utf-8") as f:
        return {"message": "Loaded", "data": json.load(f)}

# Create a new chapter or overwrite it
@app.post("/api/{username}/{chapter_id}")
async def save_chapter(username: str, chapter_id: str, request: Request):
    try:
        body = await request.json()
        prompt = body["prompt"]
        char1 = body["char1"]
        char2 = body["char2"]
        background = body["background"] 
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")
    except Exception:
        print("there was a bad call ")
        raise HTTPException(status_code=400, detail="Invalid JSON")


    print(f"Prompt is {prompt}")
    print(f"char1 is {char1}")
    print(f"char2 is {char2}")
    print(f"background is is {background}")

    # build input json for the actual story to be generated:
    chapter_input = {
        "characters": [char1, char2],
        "start_setting": background if isinstance(background, str) else background.get("name", "Unknown"),
        "story_direction": prompt
    }
    
    # Generate the full story
    try:
        story_segments = generate_ai_calls.generate_story(chapter_input)
    except Exception as e:
        print(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Construct the final output object
    final_output = {
        "title": "Generated Story",
        "characters": [char1, char2],
        "backgrounds": [background],
        "setting_narration": "Scene generated by AI.",
        "segments": story_segments
    }

    # Save to file
    path = get_chapter_path(username, chapter_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)

    return {"status": "success", "path": f"{username}/{chapter_id}/output.json", "data": final_output}


# NEW: Simplified generation endpoint
@app.post("/api/generate")
async def generate_chapter(request: GenerateRequest):
    """
    Generate a new chapter from a simple prompt.
    Auto-increments chapter ID and uses simplified generation.
    """
    try:
        prompt = request.prompt
        username = request.username
        
        if not prompt or not prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if not username or not username.strip():
            raise HTTPException(status_code=400, detail="Username cannot be empty")
            
        # Validate user exists
        if not auth.get_user(username):
             raise HTTPException(status_code=401, detail="User not found")
        
        # Get next chapter ID
        chapter_id = utils.get_next_chapter_id(username)
        print(f"Generating chapter {chapter_id} for user {username}")
        print(f"Prompt: {prompt}")
        
        # Generate the chapter using new simplified function
        chapter_data = generate_ai_calls.generate_chapter_from_prompt(prompt)
        
        # Save to file
        path = utils.get_chapter_path(username, chapter_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(chapter_data, f, indent=2, ensure_ascii=False)
        
        print(f"Chapter saved to {path}")
        
        return {
            "status": "success",
            "chapter_id": chapter_id,
            "path": f"{username}/{chapter_id}/output.json",
            "data": chapter_data
        }
        
    except Exception as e:
        print(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Mount the /data directory for direct file access
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")


# ---- MAIN ENTRY ----
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=6002, reload=True)
