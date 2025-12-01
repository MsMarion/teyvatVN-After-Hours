"""
Database Configuration

This file handles the connection to our database (SQLite).
It uses a library called "SQLAlchemy", which is the most popular way to work with databases in Python.

Key Concepts:
1.  **Engine**: The actual connection to the database file.
2.  **Session**: A temporary workspace for database operations. Think of it like opening a file, making changes, and then saving.
3.  **Base**: A template class that all our data models (Users, Stories) will inherit from.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Database URL ---
# This tells SQLAlchemy where to find our database file.
# "sqlite:///./sql_app.db" means "use SQLite and look for a file named 'sql_app.db' in the current folder".
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# --- Create Engine ---
# The engine is the starting point for any SQLAlchemy application.
# It's like the ignition key for the database.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # "check_same_thread": False is ONLY needed for SQLite.
    # It allows multiple parts of our web server to access the database at the same time.
    connect_args={"check_same_thread": False}
)

# --- Create Session Factory ---
# 'SessionLocal' is a factory that produces new database sessions.
# We configure it to:
# - autocommit=False: Wait for us to explicitly say "save" (commit) before writing to the DB.
# - autoflush=False: Wait for us to explicitly say "push changes" (flush) before sending data to the DB.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Create Base Model ---
# We will create our own models (like User, Story) by inheriting from this 'Base' class.
# It helps SQLAlchemy map our Python classes to SQL tables.
Base = declarative_base()

# --- Database Dependency ---
# This function is used by FastAPI to give each request its own database session.
def get_db():
    """
    Creates a new database session for a request, and closes it when the request is done.
    
    Usage in a route:
    def create_user(user: UserCreate, db: Session = Depends(get_db)):
        ...
    """
    db = SessionLocal()
    try:
        # 'yield' gives the session to the function that asked for it.
        # The code pauses here while the request is being processed.
        yield db
    finally:
        # This block runs AFTER the request is finished (even if there was an error).
        # We must always close the session to free up resources.
        db.close()
