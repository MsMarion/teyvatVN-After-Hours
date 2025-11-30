from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import os
import json
import shutil

from app.core.database import get_db
from app.common import utils
from app.services import auth_service

router = APIRouter()

# Define where chapter data is stored (should be in config but using relative for now)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

@router.get("/api/library/{username}")
def get_library(username: str, db: Session = Depends(get_db)):
    """
    Get all chapters for a user.
    Returns a list of chapter metadata.
    """
    if not auth_service.get_user(db, username):
        raise HTTPException(status_code=404, detail="User not found")
    
    chapters = utils.list_user_chapters(username)
    return {
        "status": "success",
        "username": username,
        "chapters": chapters,
        "count": len(chapters)
    }

@router.get("/api/chapter/{username}/{chapter_id}")
def get_chapter(username: str, chapter_id: str):
    path = utils.get_chapter_path(username, chapter_id)
    if not os.path.exists(path):
        return {"message": "Chapter not found", "data": None}
    with open(path, "r", encoding="utf-8") as f:
        return {"message": "Loaded", "data": json.load(f)}

@router.delete("/api/chapter/{username}/{chapter_id}")
def delete_chapter(username: str, chapter_id: str):
    """Delete a chapter and its directory."""
    chapter_dir = os.path.join(DATA_DIR, username, chapter_id)
    
    if not os.path.exists(chapter_dir):
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    try:
        shutil.rmtree(chapter_dir)
        return {"status": "success", "message": f"Chapter {chapter_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete chapter: {str(e)}")

@router.put("/api/chapter/{username}/{chapter_id}")
async def rename_chapter(username: str, chapter_id: str, request: Request):
    """Update the title of a chapter."""
    try:
        body = await request.json()
        new_title = body.get("title")
        
        if not new_title:
            raise HTTPException(status_code=400, detail="Title is required")
        
        path = utils.get_chapter_path(username, chapter_id)
        
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        with open(path, "r", encoding="utf-8") as f:
            chapter_data = json.load(f)
        
        chapter_data["title"] = new_title
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(chapter_data, f, indent=2, ensure_ascii=False)
        
        return {"status": "success", "message": "Title updated", "data": chapter_data}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/chapter/{username}/{chapter_id}/segments")
async def update_segments(username: str, chapter_id: str, request: Request):
    """Update the segments of a chapter."""
    try:
        body = await request.json()
        segments = body.get("segments")
        
        if not segments or not isinstance(segments, list):
            raise HTTPException(status_code=400, detail="Segments array is required")
        
        path = utils.get_chapter_path(username, chapter_id)
        
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        with open(path, "r", encoding="utf-8") as f:
            chapter_data = json.load(f)
        
        chapter_data["segments"] = segments
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(chapter_data, f, indent=2, ensure_ascii=False)
        
        return {"status": "success", "message": "Segments updated", "data": chapter_data}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
