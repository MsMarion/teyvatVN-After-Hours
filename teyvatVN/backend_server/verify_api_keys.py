import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api_keys():
    # 1. Register/Login a user
    username = "testuser_apikey"
    password = "password123"
    email = "test_apikey@example.com"
    
    print(f"1. Registering/Logging in user: {username}")
    # Try login first
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "username": username,
        "password": password,
        "email": email
    })
    
    if response.status_code != 200:
        # Register if login fails
        print("Login failed, registering...")
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "username": username,
            "password": password,
            "email": email
        })
        if response.status_code != 200:
            print(f"Registration failed: {response.text}")
            return
            
        # Login again
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": username,
            "password": password,
            "email": email
        })
    
    token = response.json()["token"]
    print("Logged in successfully.")
    
    # 2. Set API Key
    api_key = "AIzaSyTestKey123"
    print(f"2. Setting API Key to: {api_key}")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Note: The endpoint expects username in body as per my implementation, 
    # though ideally it should take it from token. 
    # My implementation:
    # class UpdateSettingsRequest(BaseModel):
    #    username: str
    #    gemini_api_key: str
    
    response = requests.put(f"{BASE_URL}/api/user/settings", json={
        "username": username,
        "gemini_api_key": api_key
    }, headers=headers)
    
    if response.status_code == 200:
        print("API Key set successfully.")
    else:
        print(f"Failed to set API Key: {response.text}")
        return

    # 3. Verify API Key
    print("3. Verifying API Key...")
    response = requests.get(f"{BASE_URL}/api/user/settings/{username}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data["gemini_api_key"] == api_key:
            print("Verification SUCCESS: API Key matches.")
        else:
            print(f"Verification FAILED: Expected {api_key}, got {data['gemini_api_key']}")
    else:
        print(f"Failed to get settings: {response.text}")

if __name__ == "__main__":
    test_api_keys()
