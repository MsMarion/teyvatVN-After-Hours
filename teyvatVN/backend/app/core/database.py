"""
Database configuration and session management.

This module sets up the SQLAlchemy engine, session factory, and base class for models.
It also provides a dependency `get_db` for FastAPI routes to access the database session.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL
# In a production environment, this should be configured via environment variables.
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Create the SQLAlchemy engine
# connect_args={"check_same_thread": False} is specifically needed for SQLite
# because by default it only allows the thread that created the connection to use it.
# FastAPI runs in multiple threads, so we need to disable this check.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a SessionLocal class
# Each instance of SessionLocal will be a database session.
# autocommit=False: We want to manually commit transactions.
# autoflush=False: We want to manually flush changes to the DB.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models
# All database models should inherit from this class.
Base = declarative_base()

# Dependency to get the database session
def get_db():
    """
    Dependency that provides a database session to a path operation function.
    It yields the session and ensures it is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
