# Summary of Authentication System Implementation

This document provides a detailed, step-by-step summary of the work done to upgrade the authentication system. It is intended to help the next developer understand the changes and diagnose any remaining issues.

## Phase 1: Database and User Model Setup

The goal was to replace the `users.json` file with a proper SQLite database.

1.  **Dependencies Added:**
    *   `SQLAlchemy` and `alembic` were added to `teyvatVN/backend_server/requirements.txt` to manage the database and migrations.

2.  **Database Configuration (`database.py`):**
    *   Created `teyvatVN/backend_server/database.py`.
    *   This file sets up the SQLAlchemy engine for a SQLite database (`sql_app.db`) and provides a `get_db` dependency for FastAPI.

3.  **User Model (`models.py`):**
    *   Created `teyvatVN/backend_server/models.py`.
    *   Defined a `User` model with fields for `id`, `username`, `email`, `hashed_password`, etc.
    *   **Update:** The `email` field was later made non-nullable to ensure a unique identifier for all users.

4.  **Database Migrations (Alembic):**
    *   Initialized Alembic in `teyvatVN/backend_server/alembic`.
    *   **Issue:** Encountered and resolved several issues with SQLite's limited `ALTER TABLE` support. The final solution was to modify the initial migration script directly to create the correct schema from the start, avoiding `ALTER` commands.
    *   The final schema correctly defines the `users` table with a non-nullable `email` field.

## Phase 2: JWT and Google OAuth2 Implementation

The goal was to implement a secure token-based authentication system and add Google as a login provider.

1.  **Dependencies Added:**
    *   `httpx` (for calling Google's API), `python-jose` (for JWTs), and `python-dotenv` were added to `requirements.txt`.

2.  **Environment Variables (`.env.example`):**
    *   Added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SECRET_KEY` to `.env.example`. The `SECRET_KEY` is crucial for signing JWTs.

3.  **JWT Utilities (`jwt_utils.py`):**
    *   Created `teyvatVN/backend_server/jwt_utils.py`.
    *   This file contains functions to `create_access_token`, `create_partial_token` (for the new user flow), and `verify_token`.

4.  **Google OAuth2 Logic (`google_auth.py`):**
    *   Created `teyvatVN/backend_server/google_auth.py`.
    *   This file handles the communication with Google's OAuth2 endpoints.
    *   **Issue:** Encountered and fixed several `jose.exceptions` related to decoding the Google ID token (`TypeError: decode() missing key`, `JWTClaimsError: Invalid audience`, `JWTClaimsError: No access_token provided`). The final implementation correctly decodes the token by providing necessary options.

5.  **Refactored Core Auth Logic (`auth.py`):**
    *   The original file was completely refactored to remove all `users.json` logic.
    *   Functions like `create_user` and `authenticate_user` now use the SQLAlchemy session to interact with the SQLite database.

6.  **Backend Endpoints (`main.py`):**
    *   `/api/auth/login`: Updated to use the new `auth.py`, and upon success, it generates and returns a full JWT.
    *   `/api/auth/register`: Updated to require `username`, `password`, and `email`. It uses the new `auth.create_user`.
    *   `/api/auth/google/login`: Initiates the Google OAuth2 flow.
    *   `/api/auth/google/callback`:
        *   If the user exists (matched by email), it logs them in and redirects to the frontend with a full JWT.
        *   If the user is new, it redirects to a new `/complete-registration` frontend route with a temporary, partial JWT.
    *   `/api/auth/complete-registration`: A new endpoint created to finalize registration for new Google users. It verifies the partial token and creates the user with their chosen username.
    *   `/api/generate`: This story generation endpoint is now protected and requires a valid JWT. It gets the user's identity from the token, not the request body. The Pydantic model for this request was updated to only require `prompt`.
    *   **Logging:** Added print statements to the `/api/generate` endpoint to log incoming request headers for debugging.

## Phase 3: Frontend Integration

The goal was to connect the frontend UI to the new backend authentication system.

1.  **Dependencies Added:**
    *   `axios` was added to the frontend for making API calls.
    *   `jwt-decode` was added to parse JWTs on the client side.

2.  **Centralized API Calls (`axios.js`):**
    *   Created `teyvatVN/src/api/axios.js`.
    *   This file creates a shared `axios` instance.
    *   Crucially, it adds a **request interceptor** that is designed to automatically get the `authToken` from `localStorage` and add it to the `Authorization` header of every outgoing request.
    *   **Logging:** Added `console.log` statements here to verify if the token is being found and if the header is being set.

3.  **Authentication Context (`AuthContext.jsx`):**
    *   Refactored to use the new shared `axios` instance.
    *   The `login` and `register` functions were updated to call the backend and store the received JWT in `localStorage`.
    *   A `googleLogin` function was added to initiate the Google login flow.
    *   The `useEffect` hook was updated to use `jwt-decode` to get the username from the stored JWT on page load, ensuring the correct user is displayed.
    *   `setToken` and `setUser` were correctly exposed in the provider's value.

4.  **Login Page (`LoginPage.jsx`):**
    *   An `email` field was added to the registration form.
    *   A "Login with Google" button was added.
    *   A `useEffect` hook was added to handle the callback from the backend for both successful Google logins and the new user registration flow.

5.  **New Registration Page (`CompleteRegistrationPage.jsx`):**
    *   Created this new page at the `/complete-registration` route.
    *   It parses the partial token from the URL, displays the user's email, and provides a form to choose a username.
    *   It calls the `/api/auth/complete-registration` endpoint and logs the user in upon success.

6.  **Story Generation Page (`prompt_input_page.jsx`):**
    *   The `handleGenerate` function was updated to use the shared `axios` instance.
    *   The `username` was removed from the request body, as the backend now gets this information from the JWT provided by the interceptor.

## Current Unresolved Issue

Despite the backend being verifiable via `curl` and the frontend code appearing logically correct, the story generation for a logged-in user is still failing. The primary suspicion remains that the `Authorization` header is not being correctly sent from the frontend to the backend when the `/api/generate` call is made. The next step for diagnosis is to inspect the browser's developer console output when the "Generate" button is clicked to see the logs from the Axios interceptor.
