"""
Authentication Service.

This module provides services for user authentication, including password hashing,
user creation, and user retrieval.
"""

import os
import bcrypt
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import datetime

from app.core.database import get_db
from app.models.sql import User

def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

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
    Verify a password against a hash.

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

def get_user(db: Session, username: str) -> Optional[User]:
    """
    Get a user by username from the database.

    Args:
        db (Session): The database session.
        username (str): The username to search for.

    Returns:
        Optional[User]: The user object if found, None otherwise.
    """
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email from the database.

    Args:
        db (Session): The database session.
        email (str): The email to search for.

    Returns:
        Optional[User]: The user object if found, None otherwise.
    """
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, password: str, email: str, gemini_api_key: str = None) -> Optional[User]:
    """
    Create a new user in the database.

    Args:
        db (Session): The database session.
        username (str): The username.
        password (str): The plain text password.
        email (str): The email address.
        gemini_api_key (str, optional): The user's Gemini API key (encrypted).

    Returns:
        Optional[User]: The created user object, or None if user already exists.
    """
    if get_user(db, username) or get_user_by_email(db, email):
        return None
    
    hashed_password = get_password_hash(password)
    db_user = User(username=username, email=email, hashed_password=hashed_password, gemini_api_key=gemini_api_key)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user.

    Args:
        db (Session): The database session.
        username (str): The username.
        password (str): The plain text password.

    Returns:
        Optional[User]: The User object if credentials are valid, None otherwise.
    """
    user = get_user(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user