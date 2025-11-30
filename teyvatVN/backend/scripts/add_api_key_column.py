import sqlite3
import os

DB_PATH = "sql_app.db"

def add_column():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("Attempting to add gemini_api_key column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN gemini_api_key VARCHAR")
        conn.commit()
        print("Successfully added gemini_api_key column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column gemini_api_key already exists.")
        else:
            print(f"Error adding column: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_column()
