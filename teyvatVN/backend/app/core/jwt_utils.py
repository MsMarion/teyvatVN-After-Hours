"""
JWT (JSON Web Token) utilities.

This module handles the creation and verification of JWTs used for authentication.
It includes functions to create access tokens, partial registration tokens, and verify existing tokens.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from dotenv import load_dotenv
import os

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Access tokens expire in 30 minutes

if SECRET_KEY is None:
    raise ValueError("SECRET_KEY environment variable not set.")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a JWT access token.

    Args:
        data (dict): The payload data to include in the token.
        expires_delta (Optional[timedelta]): The duration until the token expires.
                                             If not provided, defaults to ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        str: The encoded JWT string.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_partial_token(data: dict):
    """
    Creates a short-lived JWT for partial registration.

    This is used when a user authenticates with Google but hasn't completed
    the registration process (e.g., setting a password).

    Args:
        data (dict): The payload data.

    Returns:
        str: The encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=10) # Short-lived token
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
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
