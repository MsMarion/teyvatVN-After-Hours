"""
Authentication Service

This file contains the logic for managing users and passwords.
It acts as the "Bouncer" for our application.

Key Responsibilities:
1.  **Hashing Passwords**: Turning "password123" into secure gibberish so we don't store plain text.
2.  **Verifying Passwords**: Checking if a login password matches the stored hash.
3.  **User Management**: Finding, creating, and authenticating users in the database.
"""

import os
import bcrypt
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import datetime

from app.core.database import get_db
from app.models.sql import User

# --- Password Security ---

def get_password_hash(password: str) -> str:
    """
    Takes a plain password and turns it into a secure hash.
    
    We use 'bcrypt', a standard library for this. It adds a random "salt"
    so that even if two users have the same password, their hashes are different.

    Args:
        password (str): The plain text password.

    Returns:
        str: The hashed password.
    """
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a password entered by a user matches the hash in the database.

    Args:
        plain_password (str): The plain text password to check.
        hashed_password (str): The hashed password to check against.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

# --- User Management ---

def get_user(db: Session, username: str) -> Optional[User]:
    """
    Finds a user in the database by their username.
    Returns None if they don't exist.

    Args:
        db (Session): The database session.
        username (str): The username to search for.

    Returns:
        Optional[User]: The user object if found, None otherwise.
    """
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Finds a user in the database by their email address.

    Args:
        db (Session): The database session.
        email (str): The email to search for.

    Returns:
        Optional[User]: The user object if found, None otherwise.
    """
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, password: str, email: str, gemini_api_key: str = None) -> Optional[User]:
    """
    Registers a new user.
    
    1. Checks if the username or email is already taken.
    2. Hashes the password.
    3. Saves the new user to the database.


    Args:
        db (Session): The database session.
        username (str): The username.
        password (str): The plain text password.
        email (str): The email address.
        gemini_api_key (str, optional): The user's Gemini API key (encrypted).

    Returns:
        Optional[User]: The created user object, or None if user already exists.
    """
    # Check for duplicates
    if get_user(db, username) or get_user_by_email(db, email):
        return None
    
    # Secure the password
    hashed_password = get_password_hash(password)
    
    # Create the User object
    db_user = User(
        username=username, 
        email=email, 
        hashed_password=hashed_password, 
        gemini_api_key=gemini_api_key
    )
    
    # Save to DB
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Reload to get the generated ID
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    The main login function.
    
    1. Finds the user.
    2. Checks the password.
    3. Returns the user if everything is correct.
    Args:
        db (Session): The database session.
        username (str): The username.
        password (str): The plain text password.

    Returns:
        Optional[User]: The authenticated user object, or None if authentication fails.
    """
    user = get_user(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user