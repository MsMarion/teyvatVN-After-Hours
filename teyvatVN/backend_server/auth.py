import os
import json
import bcrypt
from typing import Optional

# Path to users file
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def load_users() -> dict:
    """Load users from the JSON file."""
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("users", {})
    except Exception as e:
        print(f"Error loading users: {e}")
        return {}

def save_users(users: dict):
    """Save users to the JSON file."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump({"users": users}, f, indent=2)

def get_user(username: str) -> Optional[dict]:
    """Get a user by username."""
    users = load_users()
    return users.get(username)

def create_user(username: str, password: str) -> bool:
    """Create a new user. Returns False if user already exists."""
    users = load_users()
    if username in users:
        return False
    
    users[username] = {
        "password_hash": get_password_hash(password),
        "created_at": "now" # You might want to use datetime.now().isoformat()
    }
    save_users(users)
    return True

def authenticate_user(username: str, password: str) -> bool:
    """Authenticate a user. Returns True if credentials are valid."""
    user = get_user(username)
    if not user:
        return False
    return verify_password(password, user["password_hash"])
