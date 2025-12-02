"""
Google OAuth2 Authentication Utilities

This file handles the "Login with Google" feature.
It allows users to sign in using their Google account instead of creating a new password.

The Flow:
1.  **Redirect**: We send the user to Google's login page.
2.  **Login**: User logs in on Google.
3.  **Callback**: Google sends the user back to us with a special code.
4.  **Exchange**: We trade that code for an ID Token (proof of who they are).
"""

import os
from dotenv import load_dotenv
import httpx
from fastapi import HTTPException, status
from jose import jwt

load_dotenv()

# --- Configuration ---
# These keys come from the Google Cloud Console.
from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL, FRONTEND_URL

# Where Google sends the user after they log in. Must match exactly what's set in Google Console.
GOOGLE_REDIRECT_URI = f"{FRONTEND_URL}/api/auth/google/callback"
print(f"DEBUG: GOOGLE_REDIRECT_URI set to: {GOOGLE_REDIRECT_URI}")

# Google's official URLs
GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

async def get_google_oauth_url():
    """
    Generates the link that the user clicks to start the Google Login process.
    
    Returns:
        str: A long URL starting with 'https://accounts.google.com...'
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google Client ID not configured.")

    params = {
        "response_type": "code", # We want an Authorization Code
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile", # What info we want (Email, Name, Picture)
        "access_type": "offline",
        "prompt": "select_account", # Always ask which account to use
    }
    from urllib.parse import urlencode
    return f"{GOOGLE_AUTHORIZATION_URL}?{urlencode(params)}"

async def google_callback(code: str):
    """
    Handles the Google OAuth2 callback.

    Exchanges the authorization code for an access token and ID token,
    then decodes the ID token to get user information.
    
    Args:
        code (str): The authorization code received from Google.
        
    Returns:
        dict: A dictionary containing user information (email, name, picture, tokens).
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google Client ID or Secret not configured.")

    token_params = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    # We use 'httpx' (like axios but for Python) to talk to Google's servers
    async with httpx.AsyncClient() as client:
        # 1. Trade the Code for Tokens
        token_response = await client.post(GOOGLE_TOKEN_URL, data=token_params)
        token_response.raise_for_status()
        token_data = token_response.json()

        id_token = token_data.get("id_token") # The ID Badge
        access_token = token_data.get("access_token") # The Key

        if not access_token or not id_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to get access or ID token from Google.")

        # 2. Decode the ID Token to read the user's info
        # (We skip signature verification here because we just got it directly from Google via HTTPS)
        user_info = jwt.decode(id_token, None, audience=GOOGLE_CLIENT_ID, options={"verify_signature": False, "verify_at_hash": False})

        return {
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "picture": user_info.get("picture"),
            "id_token": id_token,
            "access_token": access_token,
        }
