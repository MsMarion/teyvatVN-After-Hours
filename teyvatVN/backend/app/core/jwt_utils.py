"""
JWT (JSON Web Token) Utilities

This file manages our "Digital ID Cards" (Tokens).
When a user logs in, we give them a Token. They show this token with every request
to prove who they are, so they don't have to send their password every time.

Key Concepts:
1.  **JWT**: A secure string that contains data (like user ID) and is signed by us.
2.  **Access Token**: The main ID card used to access the app. Expires quickly (30 mins).
3.  **Partial Token**: A temporary pass used during the Google Login process.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from dotenv import load_dotenv
import os

load_dotenv()

# --- Configuration ---
# SECRET_KEY: The digital signature stamp. Only we have this.
# If someone changes the token data, the signature won't match, and we'll know it's fake.
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256" # The math used to sign the token
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # How long the token is valid for

if SECRET_KEY is None:
    raise ValueError("SECRET_KEY environment variable not set.")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a standard Access Token (User ID Badge).
    
    Args:
        data (dict): The payload data to include in the token.
        expires_delta (Optional[timedelta]): The duration until the token expires.
                                             If not provided, defaults to ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        str: The encoded JWT string.
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add 'exp' (expiration) claim to the data
    to_encode.update({"exp": expire})
    
    # Sign the token with our SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_partial_token(data: dict):
    """
    Creates a temporary "Partial Registration" token.
    
    Used when a user logs in with Google but hasn't finished setting up their account
    (e.g., they need to choose a username). This token is only valid for 10 minutes
    and has limited permissions ("scope": "partial_registration").
    
    Args:
        data (dict): The payload data to include in the token.
    
    Returns:
        str: The encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=10) # Short life
    to_encode.update({"exp": expire, "scope": "partial_registration"})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """
    Verifies a JWT and returns its payload.
    
    Args:
        token (str): The JWT string to verify.
    
    Returns:
        Optional[dict]: The decoded payload if valid, None otherwise.
    """
    
    # 1. Checks the signature (was it signed by us?)
    # 2. Checks the expiration (is it still valid?)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Token is fake, expired, or tampered with
        return None
