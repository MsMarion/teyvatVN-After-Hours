"""
Security Utilities (Encryption)

This file handles the encryption and decryption of sensitive data, like API keys.
We use a method called "Fernet" (from the 'cryptography' library), which is a standard, secure way to encrypt text.

How it works:
1.  We have a secret "Key" (like a password) stored in our .env file.
2.  **Encrypt**: We take plain text ("my-secret-key") + the Key -> Scrambled text ("gAAAAABl...").
3.  **Decrypt**: We take Scrambled text + the Key -> Plain text ("my-secret-key").
"""

from cryptography.fernet import Fernet
import os
import base64

# --- Load Encryption Key ---
# We try to get the key from the environment variables (.env file).
# This key MUST be kept secret! If someone gets it, they can decrypt all our data.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    print("WARNING: ENCRYPTION_KEY not found in environment variables.")
    print("Generating a temporary key for this session (or for you to save to .env).")
    # Generate a random key if one doesn't exist (useful for first-time setup)
    key = Fernet.generate_key()
    ENCRYPTION_KEY = key.decode()
    print(f"Generated Key: {ENCRYPTION_KEY}")
    print("Please add this to your .env file as ENCRYPTION_KEY=...")

# --- Initialize Cipher ---
# The 'cipher_suite' is the tool that actually does the locking and unlocking using our key.
cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_value(value: str) -> str:
    """
        Encrypts a string value.

    Args:
        value (str): The plaintext string to encrypt.

    Returns:
        str: The encrypted string (base64 encoded).
    
    Example: encrypt_value("hello") -> "gAAAAAB..."
    """
    if not value:
        return value
    encrypted_bytes = cipher_suite.encrypt(value.encode())
    return encrypted_bytes.decode()

def decrypt_value(value: str) -> str:
    """
    Decrypts a scrambled string back to plain text.
    Args:
        value (str): The encrypted string to decrypt.
    Returns:
        str: The decrypted plaintext string.

    Example: decrypt_value("gAAAAAB...") -> "hello"
    """
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
