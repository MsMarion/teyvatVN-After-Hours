import os
import re
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def get_next_chapter_id(username: str) -> str:
    """
    Get the next available chapter ID for a user.
    Returns 'chapter1' if no chapters exist, otherwise 'chapterN+1'.
    """
    user_dir = os.path.join(DATA_DIR, username)
    
    # If user directory doesn't exist, this is their first chapter
    if not os.path.exists(user_dir):
        return "chapter1"
    
    # Get all directories that start with 'chapter'
    chapters = [d for d in os.listdir(user_dir) if d.startswith("chapter") and os.path.isdir(os.path.join(user_dir, d))]
    
    if not chapters:
        return "chapter1"
    
    # Extract numbers from chapter names
    numbers = []
    for chapter in chapters:
        match = re.search(r'chapter(\d+)', chapter)
        if match:
            numbers.append(int(match.group(1)))
    
    # Get next number
    next_num = max(numbers) + 1 if numbers else 1
    return f"chapter{next_num}"


def list_user_chapters(username: str) -> list[dict]:
    """
    List all chapters for a user.
    Returns a list of chapter metadata.
    """
    user_dir = os.path.join(DATA_DIR, username)
    
    if not os.path.exists(user_dir):
        return []
    
    chapters = []
    for chapter_dir in os.listdir(user_dir):
        chapter_path = os.path.join(user_dir, chapter_dir)
        if os.path.isdir(chapter_path):
            output_file = os.path.join(chapter_path, "output.json")
            if os.path.exists(output_file):
                chapters.append({
                    "chapter_id": chapter_dir,
                    "path": output_file
                })
    
    return chapters


def get_chapter_path(username: str, chapter_id: str) -> str:
    """
    Get the full path to a chapter's output.json file.
    Creates the directory if it doesn't exist.
    """
    folder = os.path.join(DATA_DIR, username, chapter_id)
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "output.json")
