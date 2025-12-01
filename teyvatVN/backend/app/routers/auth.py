"""
Authentication router.

This module defines API endpoints for user authentication, registration,
and settings management. It supports both local (username/password) and Google OAuth2 authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
import os
from pydantic import BaseModel

from app.core.database import get_db
from app.core import jwt_utils, security, google_auth
from app.services import auth_service
from app.models.sql import User

router = APIRouter()

# --- Data Models (Request Bodies) ---
# These classes define what data we expect the Frontend to send us.

class AuthRequest(BaseModel):
    username: str
    password: str
    email: str
    gemini_api_key: str | None = None

class UpdateSettingsRequest(BaseModel):
    username: str
    gemini_api_key: str

class CompleteRegistrationRequest(BaseModel):
    token: str
    username: str
    gemini_api_key: str | None = None

from app.core.config import FRONTEND_URL

@router.post("/api/auth/complete-registration")
async def complete_registration(request: CompleteRegistrationRequest, db: Session = Depends(get_db)):
    """
    Complete user registration after Google OAuth.

    This endpoint is used when a user signs up with Google but needs to provide
    additional information (like a username) to complete their account setup.
    """
    token = request.token
    username = request.username

    # Verify the partial token
    payload = jwt_utils.verify_token(token)
    if not payload or payload.get("scope") != "partial_registration":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token.")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token is missing email information.")

    # Check if username or email already exist
    if auth_service.get_user(db, username=username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken.")
    if auth_service.get_user_by_email(db, email=email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    # Create the new user
    encrypted_key = security.encrypt_value(request.gemini_api_key) if request.gemini_api_key else None
    user = auth_service.create_user(db, username=username, password=os.urandom(16).hex(), email=email, gemini_api_key=encrypted_key)
    if not user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user.")

    # Generate a full access token
    access_token = jwt_utils.create_access_token(data={"sub": user.username})
    return {"status": "success", "username": user.username, "token": access_token}

@router.get("/api/auth/google/login")
async def google_login():
    """
    Initiate Google OAuth2 login flow.
    Redirects the user to Google's authorization page.
    """
    google_oauth_url = await google_auth.get_google_oauth_url()
    return RedirectResponse(google_oauth_url)

@router.get("/api/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle Google OAuth2 callback.
    
    Receives the authorization code, exchanges it for tokens, and retrieves user info.
    If the user exists, logs them in. If not, redirects to registration completion.
    """
    user_info = await google_auth.google_callback(code)
    email = user_info.get("email")
    name = user_info.get("name")

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google did not provide an email.")

    user = auth_service.get_user_by_email(db, email)
    
    # If user already exists, log them in directly
    if user:
        access_token = jwt_utils.create_access_token(data={"sub": user.username})
        frontend_url = f"{FRONTEND_URL}/login?token={access_token}&username={user.username}"
        return RedirectResponse(url=frontend_url)

    # If user does not exist, create a partial token and redirect to complete registration
    else:
        partial_token_data = {"email": email, "name": name}
        partial_token = jwt_utils.create_partial_token(data=partial_token_data)
        frontend_url = f"{FRONTEND_URL}/complete-registration?token={partial_token}"
        return RedirectResponse(url=frontend_url)

@router.post("/api/auth/register")
async def register(request: AuthRequest, db: Session = Depends(get_db)):
    """
    Register a new user with username and password.
    """
    if not request.username or not request.password or not request.email:
        raise HTTPException(status_code=400, detail="Username, password, and email are required")
    
    encrypted_key = security.encrypt_value(request.gemini_api_key) if request.gemini_api_key else None
    user = auth_service.create_user(db, request.username, request.password, request.email, encrypted_key)
    if not user:
        raise HTTPException(status_code=400, detail="User with this username or email already exists")
    
    return {"status": "success", "message": "User created"}

@router.post("/api/auth/login")
async def login(request: AuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user with username and password.
    Returns a JWT access token upon success.
    """
    user = auth_service.authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = jwt_utils.create_access_token(data={"sub": user.username})
    return {"status": "success", "username": user.username, "token": access_token}

@router.put("/api/user/settings")
async def update_settings(request: UpdateSettingsRequest, db: Session = Depends(get_db)):
    """
    Update user settings (e.g., Gemini API key).
    """
    user = auth_service.get_user(db, request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.gemini_api_key = security.encrypt_value(request.gemini_api_key)
    db.commit()
    
    return {"status": "success", "message": "Settings updated"}

@router.get("/api/user/settings/{username}")
async def get_settings(username: str, db: Session = Depends(get_db)):
    """
    Get user settings.
    Returns the decrypted Gemini API key.
    """
    user = auth_service.get_user(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "status": "success", 
        "gemini_api_key": security.decrypt_value(user.gemini_api_key)
    }
