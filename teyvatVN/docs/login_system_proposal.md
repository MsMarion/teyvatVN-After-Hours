# Technical Proposal: Login System MVP

## 1. Architecture Overview
The MVP login system will use a lightweight, file-based approach for user management, keeping with the "super simple" requirement while maintaining basic security standards (password hashing).

### Components
- **Frontend (React)**: Handles user input, stores session state, and manages protected routes.
- **Backend (FastAPI)**: Manages user data, performs authentication, and enforces access control.
- **Storage**: A JSON file (`users.json`) or a lightweight SQLite database for user records.

## 2. Backend Implementation
### 2.1 Data Storage
We will use a simple JSON file structure for the MVP to avoid setting up a full database server.
*   **File**: `backend_server/data/users.json`
*   **Structure**:
    ```json
    {
      "users": {
        "username1": {
          "password_hash": "hashed_string...",
          "created_at": "timestamp"
        }
      }
    }
    ```

### 2.2 Dependencies
- `passlib[bcrypt]`: For password hashing.
- `python-jose` (optional) or simple UUID tokens for session management.
*   *Recommendation*: Use `passlib` for hashing. For the token, a simple generated UUID mapped to the user in memory (or a separate `sessions.json`) is sufficient for MVP.

### 2.3 API Endpoints
- `POST /api/auth/register`:
    - Input: `{ username, password }`
    - Action: Check if user exists. If not, hash password and save to `users.json`. Create user data directory.
- `POST /api/auth/login`:
    - Input: `{ username, password }`
    - Action: Verify password hash. If valid, generate a simple session token.
    - Output: `{ token, username }`
- `Middleware / Dependency`:
    - Create a `get_current_user` dependency that validates the token passed in headers.

## 3. Frontend Implementation
### 3.1 State Management
- Use `AuthContext` (React Context) to manage:
    - `user`: Current user object (null if logged out).
    - `token`: Session token.
    - `login(username, password)`: Calls API, updates state.
    - `logout()`: Clears state.

### 3.2 Pages
- **LoginPage**: Existing page, updated to use `AuthContext` and call the real API.
- **Registration**: Can be a mode switch on the Login Page.

### 3.3 Routing
- Create a `ProtectedRoute` component.
- Wrap `/story`, `/characters`, and `/generate` routes with `ProtectedRoute`.
- If not authenticated, redirect to `/login`.

## 4. Migration Path to Google Auth
1.  **Database Upgrade**: Move from `users.json` to SQLite/PostgreSQL.
2.  **Auth Provider**: Integrate Firebase Auth or Auth0, or implement OAuth2 flow directly with Google.
3.  **Account Linking**: Allow existing username/password users to link a Google account.

## 5. Security Considerations (MVP)
- **Password Hashing**: Mandatory. No plain text passwords.
- **HTTPS**: Recommended for production (already handled by Cloudflare tunnel in dev).
- **Input Validation**: Sanitize username inputs to prevent path traversal (since usernames are used in file paths).

## 6. Implementation Steps
1.  **Backend**:
    - Install `passlib`.
    - Create `auth.py` for helper functions (hash, verify).
    - Implement `/register` and `/login` endpoints in `main.py`.
2.  **Frontend**:
    - Create `AuthContext.jsx`.
    - Update `LoginPage.jsx` to connect to backend.
    - Implement `ProtectedRoute` wrapper.
    - Update `App.jsx` to enforce routing.
