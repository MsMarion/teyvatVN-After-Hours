"""
Common utility functions.

This module contains helper functions for file system operations,
such as managing user chapters and data directories.
"""

import os
import re
from typing import Optional

# Base data directory
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def get_next_chapter_id(username: str) -> str:
    """
    Get the next available chapter ID for a user.
    
    Checks the user's data directory for existing chapters and returns
    the next sequential ID (e.g., 'chapter1', 'chapter2').

    Args:
        username (str): The username of the user.

    Returns:
        str: The next available chapter ID (e.g., 'chapterN+1').
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
    List all chapters for a user with metadata.
    
    Scans the user's directory for chapters and reads their metadata
    from the 'output.json' file in each chapter directory.

    Args:
        username (str): The username of the user.

    Returns:
        list[dict]: A list of dictionaries, each containing chapter metadata 
                    (id, title, characters, backgrounds, created_at, path).
    """
    import json
    from datetime import datetime
    
    user_dir = os.path.join(DATA_DIR, username)
    
    if not os.path.exists(user_dir):
        return []
    
    chapters = []
    for chapter_dir in os.listdir(user_dir):
        chapter_path = os.path.join(user_dir, chapter_dir)
        if os.path.isdir(chapter_path):
            output_file = os.path.join(chapter_path, "output.json")
            if os.path.exists(output_file):
                try:
                    # Read the chapter data
                    with open(output_file, "r", encoding="utf-8") as f:
                        chapter_data = json.load(f)
                    
                    # Get file modification time
                    mod_time = os.path.getmtime(output_file)
                    created_at = datetime.fromtimestamp(mod_time).isoformat()
                    
                    chapters.append({
                        "chapter_id": chapter_dir,
                        "title": chapter_data.get("title", "Untitled Chapter"),
                        "characters": chapter_data.get("characters", []),
                        "backgrounds": chapter_data.get("backgrounds", []),
                        "created_at": created_at,
                        "path": output_file
                    })
                except Exception as e:
                    print(f"Error reading chapter {chapter_dir}: {e}")
                    # Still include the chapter but with minimal info
                    chapters.append({
                        "chapter_id": chapter_dir,
                        "title": "Error Loading Chapter",
                        "characters": [],
                        "backgrounds": [],
                        "created_at": None,
                        "path": output_file
                    })
    
    # Sort by chapter number (newest/highest number first)
    def get_chapter_number(chapter):
        """Extract numeric value from chapter_id like 'chapter19' -> 19"""
        match = re.search(r'chapter(\d+)', chapter.get("chapter_id", ""))
        return int(match.group(1)) if match else 0
    
    chapters.sort(key=get_chapter_number, reverse=True)
    
    return chapters


def get_chapter_path(username: str, chapter_id: str) -> str:
    """
    Get the full path to a chapter's output.json file.
    
    Creates the directory structure if it doesn't exist.

    Args:
        username (str): The username.
        chapter_id (str): The chapter ID.

    Returns:
        str: The absolute path to the output.json file.
    """
    folder = os.path.join(DATA_DIR, username, chapter_id)
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "output.json")
