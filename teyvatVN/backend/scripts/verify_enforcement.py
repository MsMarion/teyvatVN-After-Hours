import requests
import json
import sys

BASE_URL = "http://localhost:8000"
USERNAME = "enforcement_test_user"
PASSWORD = "password123"
EMAIL = "enforcement@test.com"
VALID_API_KEY = "AIzaSyCjCP0qZrE5bIPV4oEOQ7wLFYjuUeefZ-I"

def run_test():
    print(f"--- Starting Enforcement Verification for {USERNAME} ---")

    # 1. Register/Login
    print("1. Authenticating...")
    auth_data = {"username": USERNAME, "password": PASSWORD, "email": EMAIL}
    response = requests.post(f"{BASE_URL}/api/auth/register", json=auth_data)
    if response.status_code not in [200, 400]: # 400 is ok if user exists
        print(f"Registration failed: {response.text}")
        sys.exit(1)
        
    response = requests.post(f"{BASE_URL}/api/auth/login", json=auth_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        sys.exit(1)
    
    token = response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Authenticated successfully.")

    # 2. Clear API Key
    print("2. Clearing API Key...")
    settings_data = {"username": USERNAME, "gemini_api_key": ""}
    response = requests.put(f"{BASE_URL}/api/user/settings", json=settings_data, headers=headers)
    if response.status_code != 200:
        print(f"Failed to clear settings: {response.text}")
        sys.exit(1)
    print("   API Key cleared.")

    # 3. Try Generation (Expect Failure)
    print("3. Testing Generation WITHOUT Key (Expect 400)...")
    gen_data = {"prompt": "A test scene", "username": USERNAME}
    response = requests.post(f"{BASE_URL}/api/generate", json=gen_data, headers=headers)
    
    if response.status_code == 400 and "Please configure your Gemini API Key" in response.text:
        print("   SUCCESS: Generation blocked as expected.")
    else:
        print(f"   FAILURE: Unexpected response: {response.status_code} - {response.text}")
        # We don't exit here, maybe dev key is on? But we expect it off.
    
    # 4. Set Valid API Key
    print("4. Setting Valid API Key...")
    settings_data = {"username": USERNAME, "gemini_api_key": VALID_API_KEY}
    response = requests.put(f"{BASE_URL}/api/user/settings", json=settings_data, headers=headers)
    if response.status_code != 200:
        print(f"Failed to set settings: {response.text}")
        sys.exit(1)
    print("   API Key set.")

    # 5. Try Generation (Expect Success)
    print("5. Testing Generation WITH Key (Expect 200)...")
    # We use a very simple prompt to be quick, but it might still take a few seconds
    gen_data = {"prompt": "A short test", "username": USERNAME}
    response = requests.post(f"{BASE_URL}/api/generate", json=gen_data, headers=headers)
    
    if response.status_code == 200:
        print("   SUCCESS: Generation successful.")
    else:
        print(f"   FAILURE: Generation failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    run_test()
