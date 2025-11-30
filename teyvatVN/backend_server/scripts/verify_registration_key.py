import requests
import json
import sys
import random
import string

BASE_URL = "http://localhost:8000"
VALID_API_KEY = "AIzaSyCjCP0qZrE5bIPV4oEOQ7wLFYjuUeefZ-I"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_test():
    print("--- Starting Registration API Key Verification ---")

    # Test 1: Register WITHOUT Key
    username1 = f"user_no_key_{get_random_string()}"
    email1 = f"{username1}@test.com"
    print(f"1. Registering {username1} WITHOUT key...")
    
    auth_data = {"username": username1, "password": "password123", "email": email1}
    response = requests.post(f"{BASE_URL}/api/auth/register", json=auth_data)
    
    if response.status_code != 200:
        print(f"   FAILURE: Registration failed: {response.text}")
        sys.exit(1)
    print("   Registration successful.")
    
    # Check settings (should be empty)
    print("   Checking settings...")
    response = requests.get(f"{BASE_URL}/api/user/settings/{username1}")
    if response.status_code == 200:
        key = response.json().get("gemini_api_key")
        if not key:
            print("   SUCCESS: API key is empty as expected.")
        else:
            print(f"   FAILURE: API key should be empty but is: {key}")
    else:
        print(f"   FAILURE: Could not get settings: {response.text}")


    # Test 2: Register WITH Key
    username2 = f"user_with_key_{get_random_string()}"
    email2 = f"{username2}@test.com"
    print(f"\n2. Registering {username2} WITH key...")
    
    auth_data = {
        "username": username2, 
        "password": "password123", 
        "email": email2,
        "gemini_api_key": VALID_API_KEY
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=auth_data)
    
    if response.status_code != 200:
        print(f"   FAILURE: Registration failed: {response.text}")
        sys.exit(1)
    print("   Registration successful.")
    
    # Check settings (should match)
    print("   Checking settings...")
    response = requests.get(f"{BASE_URL}/api/user/settings/{username2}")
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
