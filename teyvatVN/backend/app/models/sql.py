"""
Database Models (Schema)

This file defines the structure of our database tables.
In SQLAlchemy, we define "Models" (Python classes) that map directly to SQL tables.
"""

from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """
    User Model
    
    This class represents the 'users' table in our database.
    Each instance of this class corresponds to one row in the table (one user).
    """
    # The name of the table in the database
    __tablename__ = "users"

    # --- Columns ---
    
    # Primary Key: A unique ID number for every user (1, 2, 3...).
    # index=True makes searching by ID very fast.
    id = Column(Integer, primary_key=True, index=True)
    
    # Username: Must be unique (no two users can have the same name).
    username = Column(String, unique=True, index=True, nullable=False)
    
    # Email: Also must be unique.
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Password: We NEVER store the actual password. We store a "hash" (a scrambled version).
    hashed_password = Column(String, nullable=False)
    
    # Is Active: A flag to disable a user without deleting them.
    is_active = Column(Boolean, default=True)
    
    # Gemini API Key: The user's personal API key for the AI.
    # This is stored ENCRYPTED (scrambled) for security.
    gemini_api_key = Column(String, nullable=True) 
    
    # Created At: Automatically records the time when the user was created.
    created_at = Column(DateTime, server_default=func.now())
