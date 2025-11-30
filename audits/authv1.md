# Authentication Audit Report (v1)

## Overview
This document summarizes how authentication is implemented in the **TeyvatVN** project, covering both the traditional username/password flow and Google OAuth integration, as well as the frontend context that consumes these APIs.

---

## Backend – Password Authentication (`auth.py`)
- **Password hashing** – Uses **bcrypt** (`get_password_hash`) to securely hash passwords before storing them.
- **Verification** – `verify_password` checks a plain password against the stored bcrypt hash.
- **User lookup** – Helper functions `get_user` and `get_user_by_email` query the SQLAlchemy `User` model.
- **User creation** – `create_user` ensures the username/email is unique, hashes the password, creates a `User` record and returns it.
- **Authentication** – `authenticate_user` retrieves the user by username and validates the password, returning the `User` object on success.

---

## Backend – Google OAuth (`google_auth.py`)
- **Configuration** – Reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and defines a redirect URI.
- **OAuth URL** – `get_google_oauth_url` builds the authorization URL with scopes `openid email profile`.
- **Callback** – `google_callback` exchanges the authorization `code` for access & ID tokens, decodes the ID token (signature verification is omitted for simplicity) and returns user info (`email`, `name`, `picture`) plus tokens.
- **Error handling** – Raises `HTTPException` with appropriate status codes when configuration is missing or token exchange fails.

---

## Frontend – Auth Context (`AuthContext.jsx`)
- **Axios instance** – Configured with `API_URL` (base URL for auth endpoints).
- **State** – Stores `user`, `token`, and `loading` flags.
- **Login** – `login` posts to `/api/auth/login`, stores the JWT in `localStorage`, updates context state, and shows a toast.
- **Register** – `register` posts to `/api/auth/register`; on success it forwards to `login`.
- **Google Login** – `googleLogin` redirects the browser to the backend’s Google login endpoint (`/api/auth/google/login`).
- **Logout** – Clears context state and removes stored tokens.
- **Persistence** – On mount, reads `authToken` from `localStorage` to restore a logged‑in session.

---

## Tests (`test_auth.py`)
- Simple script that sends a POST request to `http://localhost:4000/api/auth/register` with a sample username/password and prints the response. Demonstrates the registration endpoint is reachable.

---

## Summary
The authentication system combines a **secure password‑based flow** (bcrypt hashing, JWT issuance) with **Google OAuth** for third‑party login. The backend provides clear helper functions for user management, while the React `AuthContext` abstracts the API calls and maintains client‑side session state. The current implementation stores the JWT in `localStorage` without verification on the client; a future improvement would be to decode/validate the token and handle token refresh.

*Audit generated on 2025‑11‑29.*
