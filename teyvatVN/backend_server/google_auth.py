import os
from dotenv import load_dotenv
import httpx
from fastapi import HTTPException, status
from jose import jwt

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://localhost:6002/api/auth/google/callback" # This should match your Google Cloud Console setup

# Google's OAuth2 endpoints
GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

async def get_google_oauth_url():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google Client ID not configured.")

    params = {
        "response_type": "code",
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    from urllib.parse import urlencode
    return f"{GOOGLE_AUTHORIZATION_URL}?{urlencode(params)}"

async def google_callback(code: str):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google Client ID or Secret not configured.")

    token_params = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data=token_params)
        token_response.raise_for_status()
        token_data = token_response.json()

        access_token = token_data.get("access_token")
        id_token = token_data.get("id_token")

        if not access_token or not id_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to get access or ID token from Google.")

        # Decode the ID token to get user info
        # Google's ID tokens are signed, but we don't need to verify the signature here
        # as we just received it from Google's secure token endpoint.
        # In a more robust system, you might want to verify the signature and issuer.
        user_info = jwt.decode(id_token, None, audience=GOOGLE_CLIENT_ID, options={"verify_signature": False, "verify_at_hash": False})

        return {
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "picture": user_info.get("picture"),
            "id_token": id_token,
            "access_token": access_token,
        }
