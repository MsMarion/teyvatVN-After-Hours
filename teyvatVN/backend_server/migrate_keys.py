import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
import security

def migrate_keys():
    print("--- Starting API Key Encryption Migration ---")
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users.")
        
        count = 0
        for user in users:
            if user.gemini_api_key:
                # Check if already encrypted? 
                # Fernet tokens start with gAAAAA... usually.
                # But to be safe, we can try to decrypt. If it fails, it's likely plaintext.
                # OR, we just assume this is a one-time migration and everything is plaintext.
                # Let's try to decrypt. If it works, skip. If it fails, encrypt.
                
                try:
                    # If this succeeds, it's likely already encrypted
                    decrypted = security.decrypt_value(user.gemini_api_key)
                    # If decrypt returns the same value (our fallback), then it wasn't encrypted properly or failed
                    # But our decrypt_value returns original on failure.
                    # So we need a way to distinguish.
                    # Let's modify security.py temporarily or just check prefix?
                    # Fernet tokens are base64url encoded.
                    # Let's just assume plaintext for now as we just implemented encryption.
                    # But wait, if I run this twice, I double encrypt.
                    # Let's check if it starts with gAAAAA.
                    if user.gemini_api_key.startswith("gAAAAA"):
                        print(f"User {user.username}: Key appears already encrypted. Skipping.")
                        continue
                        
                    print(f"User {user.username}: Encrypting key...")
                    encrypted = security.encrypt_value(user.gemini_api_key)
                    user.gemini_api_key = encrypted
                    count += 1
                except Exception as e:
                    print(f"Error processing user {user.username}: {e}")
        
        db.commit()
        print(f"Migration complete. Encrypted {count} keys.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_keys()
