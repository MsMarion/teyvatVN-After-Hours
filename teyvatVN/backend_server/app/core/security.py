from cryptography.fernet import Fernet
import os
import base64

# Load key from env or generate a new one (for dev convenience, though in prod it must be persistent)
# In a real app, this MUST be persistent.
# We will try to read from env. If not found, we warn.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    print("WARNING: ENCRYPTION_KEY not found in environment variables.")
    print("Generating a temporary key for this session (or for you to save to .env).")
    key = Fernet.generate_key()
    ENCRYPTION_KEY = key.decode()
    print(f"Generated Key: {ENCRYPTION_KEY}")
    print("Please add this to your .env file as ENCRYPTION_KEY=...")

cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_value(value: str) -> str:
    """Encrypts a string value."""
    if not value:
        return value
    encrypted_bytes = cipher_suite.encrypt(value.encode())
    return encrypted_bytes.decode()

def decrypt_value(value: str) -> str:
    """Decrypts a string value."""
    if not value:
        return value
    try:
        decrypted_bytes = cipher_suite.decrypt(value.encode())
        return decrypted_bytes.decode()
    except Exception as e:
        # If decryption fails (e.g. old plaintext data), return as is or handle error
        # For migration purposes, we might want to return the original if it's not valid fernet
        # But Fernet tokens are URL-safe base64, so normal text might look different.
        # Let's assume if it fails, it might be plaintext (during migration phase).
        print(f"Decryption failed (returning original): {e}")
        return value
