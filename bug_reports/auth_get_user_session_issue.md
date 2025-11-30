# Bug Report: `auth.get_user` Missing Session Argument

## Description
The function `auth.get_user` in `backend_server/auth.py` requires a SQLAlchemy `Session` object as its first argument (`db`). However, it is being called in `backend_server/main.py` (specifically in the `/api/generate` endpoint) without passing this session, causing the application to crash or fail when validating users.

## Location
- **File:** `backend_server/main.py`
- **Endpoint:** `/api/generate`
- **Function:** `generate_chapter`

## Snippet
```python
# Current problematic usage in main.py
if not auth.get_user(username):  # Missing 'db' argument
     raise HTTPException(status_code=401, detail="User not found")
```

## Expected Behavior
The function should be called with a valid database session:
```python
auth.get_user(db, username)
```

## Root Cause
The `generate_chapter` endpoint definition was modified to remove the dependency injection for `current_user` (which provided the user and implicitly validated the session) or `db`. As a result, `db` is not available in the local scope to be passed to `auth.get_user`.

## Proposed Fix
1. Inject `db: Session = Depends(get_db)` into the `generate_chapter` function signature.
2. Pass `db` to `auth.get_user(db, username)`.
