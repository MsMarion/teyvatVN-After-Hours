import requests
import json
import sys
import os
import random
import string

# Add current directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import jwt_utils

BASE_URL = "http://localhost:8000"
VALID_API_KEY = "AIzaSyCjCP0qZrE5bIPV4oEOQ7wLFYjuUeefZ-I"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_test():
    print("--- Starting Complete Registration API Key Verification ---")

    # 1. Create a partial token
    username = f"google_user_{get_random_string()}"
    email = f"{username}@gmail.com"
    print(f"1. Creating partial token for {email}...")
    
    partial_token_data = {"email": email, "name": "Test User", "scope": "partial_registration"}
    # We need to use the SAME secret key as the server. 
    # Since we are importing jwt_utils, it should load the same .env if we are in the right dir.
    # Let's ensure .env is loaded.
    from dotenv import load_dotenv
    load_dotenv()
    
    token = jwt_utils.create_partial_token(data=partial_token_data)
    print("   Token created.")

    # 2. Complete Registration WITH Key
    print(f"2. Completing registration for {username} WITH key...")
    
    data = {
        "token": token,
        "username": username,
        "gemini_api_key": VALID_API_KEY
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/complete-registration", json=data)
    
    if response.status_code != 200:
        print(f"   FAILURE: Registration completion failed: {response.text}")
        sys.exit(1)
    print("   Registration completed successfully.")
    
    # 3. Check settings
    print("3. Checking settings...")
    # We can use the token returned from registration to authenticate, or just check the public settings endpoint if available (it is available for any auth user, but we need a token to call it? No, the get_settings endpoint takes username but depends on get_db. Wait, get_settings is:
    # @app.get("/api/user/settings/{username}")
    # async def get_settings(username: str, db: Session = Depends(get_db)):
    # It doesn't seem to require auth dependency explicitly in the signature shown in previous `view_file`, 
    # but let's check if it's protected.
    # Actually, looking at main.py:
    # @app.get("/api/user/settings/{username}")
    # async def get_settings(username: str, db: Session = Depends(get_db)):
    # It does NOT have `token: str = Depends(oauth2_scheme)`. So it might be public?
    # Let's try accessing it.
    
    response = requests.get(f"{BASE_URL}/api/user/settings/{username}")
    if response.status_code == 200:
        key = response.json().get("gemini_api_key")
        if key == VALID_API_KEY:
            print("   SUCCESS: API key matches.")
        else:
            print(f"   FAILURE: API key mismatch. Expected {VALID_API_KEY}, got {key}")
    else:
        print(f"   FAILURE: Could not get settings: {response.text}")

if __name__ == "__main__":
    run_test()
