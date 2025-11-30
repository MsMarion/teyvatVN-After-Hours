"""
SQLAlchemy models for the database.

This module defines the database schema using SQLAlchemy ORM.
"""

from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """
    User model representing the 'users' table in the database.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    gemini_api_key = Column(String, nullable=True) # Encrypted API key
    created_at = Column(DateTime, server_default=func.now())
