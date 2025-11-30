import requests
import json

BASE_URL = "http://localhost:4000/api/auth"

def test_register():
    print("Testing Registration...")
    payload = {"username": "dawn2", "password": "password"}
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
