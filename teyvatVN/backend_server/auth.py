import os
import bcrypt
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import datetime

from database import get_db
from models import User

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def get_user(db: Session, username: str) -> Optional[User]:
    """Get a user by username from the database."""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email from the database."""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, password: str, email: Optional[str] = None) -> Optional[User]:
    """Create a new user in the database. Returns None if user already exists."""
    if get_user(db, username):
        return None
    if email and get_user_by_email(db, email):
        return None
    
    hashed_password = get_password_hash(password)
    db_user = User(username=username, email=email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user. Returns the User object if credentials are valid."""
    user = get_user(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user