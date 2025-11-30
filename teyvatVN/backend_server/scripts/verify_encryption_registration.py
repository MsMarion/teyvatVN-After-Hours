import requests
import json
import sys
import os
import random
import string
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
import security

BASE_URL = "http://localhost:8000"
VALID_API_KEY = "AIzaSyCjCP0qZrE5bIPV4oEOQ7wLFYjuUeefZ-I"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_test():
    print("--- Starting Encryption Verification on Registration ---")

    # 1. Register a new user with an API key
    username = f"encrypt_test_{get_random_string()}"
    email = f"{username}@test.com"
    print(f"1. Registering {username} with API key...")
    
    auth_data = {
        "username": username, 
        "password": "password123", 
        "email": email,
        "gemini_api_key": VALID_API_KEY
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=auth_data)
    
    if response.status_code != 200:
        print(f"   FAILURE: Registration failed: {response.text}")
        sys.exit(1)
    print("   Registration successful.")
    
    # 2. Inspect Database Directly
    print("2. Inspecting Database for Encrypted Key...")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print("   FAILURE: User not found in database.")
            sys.exit(1)
            
        stored_key = user.gemini_api_key
        print(f"   Stored Key: {stored_key}")
        
        if stored_key == VALID_API_KEY:
            print("   FAILURE: Key is stored in PLAINTEXT!")
        elif stored_key.startswith("gAAAAA"): # Fernet tokens usually start with this
            print("   SUCCESS: Key appears to be encrypted (starts with gAAAAA).")
        else:
            print("   SUCCESS: Key does not match plaintext (likely encrypted).")
            
        # 3. Verify Decryption
        print("3. Verifying Decryption...")
        decrypted_key = security.decrypt_value(stored_key)
        if decrypted_key == VALID_API_KEY:
            print("   SUCCESS: Decryption yields original key.")
        else:
            print(f"   FAILURE: Decryption failed. Got {decrypted_key}, expected {VALID_API_KEY}")
            
    except Exception as e:
        print(f"   FAILURE: Database inspection error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
