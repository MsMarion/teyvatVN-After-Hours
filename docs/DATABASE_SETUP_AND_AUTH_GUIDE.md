# Database Setup and Authentication Guide

## Overview of Changes
This guide details the setup and usage of the new robust authentication system, which includes:
-   **SQLite Database:** Replaced the `users.json` flat file with a SQLite database for user storage.
-   **SQLAlchemy & Alembic:** Implemented SQLAlchemy as the ORM and Alembic for database migrations.
-   **Google OAuth2 Integration:** Added support for user authentication via Google.
-   **Refactored Authentication Logic:** The core authentication functions have been updated to interact with the new database system.
-   **Port Configuration:** Frontend and backend ports have been updated for development.

## Prerequisites
-   Python 3.8+
-   `pip` (Python package installer)
-   It is highly recommended to use a Python virtual environment.

## Backend Setup

### 1. Navigate to the Backend Directory
Open your terminal or command prompt and navigate to the backend server directory:
```bash
cd teyvatVN/backend_server
```

### 2. Install Dependencies
Install the required Python packages, including `SQLAlchemy`, `alembic`, `httpx`, and `python-jose`:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables for Google OAuth2
Create a `.env` file in the `teyvatVN/backend_server` directory. This file will store your sensitive Google OAuth2 credentials.

**Example `.env` file content:**
```
GEMINI_API_KEY=your_gemini_api_key_if_any
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
Replace `your_google_client_id` and `your_google_client_secret` with the actual credentials obtained from your Google Cloud Console.

### 4. Database Initialization and Migrations
The database schema is managed using Alembic.

#### Initialize Alembic (Already Done)
This step has already been performed. If you were setting up from scratch, you would run:
```bash
python -m alembic init alembic
```

#### Apply Migrations
To create the `users` table in the SQLite database (`sql_app.db`), apply the migrations:
```bash
python -m alembic upgrade head
```
This command will create an `sql_app.db` file in the `teyvatVN/backend_server` directory and set up the necessary tables.

#### Resetting the Database
If you need to reset the database (e.g., for development or testing), you can:
1.  **Stop the backend server** if it's running.
2.  Delete the `sql_app.db` file:
    ```bash
    rm sql_app.db
    ```
3.  Run `python -m alembic upgrade head` again to recreate the empty schema.

### 5. Running the Backend Server
Start the FastAPI backend server using `uvicorn`:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 6002 --reload
```
The backend server will now be accessible at `http://localhost:6002`.

## Frontend Configuration

### 1. API URL Update
The frontend's API base URL has been updated to point to the new backend port. This change was made in `teyvatVN/src/config/api.js`:
```javascript
export const API_URL = "http://localhost:6002/api/generate";
```
This ensures that frontend API calls correctly target the backend server running on port `6002`.

## Testing the Authentication Endpoints

With the backend server running, you can test the authentication endpoints using tools like Postman, Insomnia, or by integrating with the frontend.

### 1. Register a User
-   **URL:** `http://localhost:6002/api/auth/register`
-   **Method:** `POST`
-   **Headers:** `Content-Type: application/json`
-   **Body (JSON):**
    ```json
    {
        "username": "testuser",
        "password": "testpassword"
    }
    ```

### 2. Log In a User
-   **URL:** `http://localhost:6002/api/auth/login`
-   **Method:** `POST`
-   **Headers:** `Content-Type: application/json`
-   **Body (JSON):**
    ```json
    {
        "username": "testuser",
        "password": "testpassword"
    }
    ```
    This will return a dummy token and the username.

### 3. Initiate Google OAuth2 Login
-   **URL:** `http://localhost:6002/api/auth/google/login`
-   **Method:** `GET`
-   Access this URL in your web browser. It will redirect you to Google's login page.

### 4. Google OAuth2 Callback
-   After successfully logging in with Google, you will be redirected to:
    `http://localhost:6002/api/auth/google/callback?code=YOUR_AUTH_CODE`
-   The backend will process this callback, fetch your Google user info, create a new user in the database if necessary, and return your user information along with a dummy token.

## Next Steps
-   Implement actual JWT generation and refresh token logic in the backend.
-   Integrate the frontend with the new Google OAuth2 flow and handle the returned tokens.
-   Implement protected routes using JWTs.
