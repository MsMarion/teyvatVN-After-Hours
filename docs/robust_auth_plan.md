# Robust Authentication System Implementation Guide

## Overview
This document serves as a blueprint for upgrading the current MVP JSON-based authentication system to a robust, secure, and scalable solution. It is intended for the next development agent to pick up and execute.

## Current State (MVP)
- **Storage**: `backend_server/data/users.json` (Flat file)
- **Auth Method**: Basic username/password matching
- **Session**: LocalStorage (manual handling)
- **Security**: Basic bcrypt hashing, no rate limiting, no token expiration handling.

## Proposed Architecture

### 1. Database Migration
**Goal**: Move away from `users.json` to a proper relational database while keeping the architecture **slim and lightweight**.
- **Primary Choice**: **SQLite**.
  - **Why**: It is serverless, single-file, and requires zero setup or maintenance. It keeps the project portable and "slim".
  - **Performance**: More than capable of handling thousands of hits per day, which fits our current needs perfectly.
- **ORM**: We will use **SQLAlchemy**. This keeps our code clean and allows for migration to a larger DB (like PostgreSQL) *only if absolutely necessary* in the far future.
- **Schema**:
  ```python
  class User(Base):
      __tablename__ = "users"
      id = Column(Integer, primary_key=True, index=True)
      username = Column(String, unique=True, index=True)
      email = Column(String, unique=True, index=True, nullable=True)
      hashed_password = Column(String)
      is_active = Column(Boolean, default=True)
      created_at = Column(DateTime, default=datetime.utcnow)
  ```

### 2. JWT Authentication (OAuth2)
**Goal**: Implement standard stateless authentication.
- **Library**: `python-jose` or `PyJWT`.
- **Flow**:
  1. User logs in -> Server validates -> Returns `access_token` (short-lived) and `refresh_token` (long-lived, HTTP-only cookie).
  2. Frontend attaches `Authorization: Bearer <token>` to requests.
  3. **FastAPI Dependency**: Use `OAuth2PasswordBearer`.

### 3. Security Enhancements
- **Rate Limiting**: Use `slowapi` to prevent brute-force attacks on `/login` and `/register`.
- **Input Validation**: Strict Pydantic models for email format, password complexity (min length, special chars).
- **CORS**: Restrict `allow_origins` to specific frontend domains in production.
- **Environment Variables**: Ensure `SECRET_KEY` and `ALGORITHM` are loaded from `.env` only.

### 4. Frontend Improvements
- **Axios Interceptor**:
  - Automatically attach token to requests.
  - Handle `401 Unauthorized` by attempting to refresh the token transparently.
  - Redirect to `/login` only if refresh fails.
- **Protected Routes**: Enhance `ProtectedRoute.jsx` to validate token expiration client-side before rendering.

## Implementation Roadmap

### Phase 1: Backend Foundation
- [ ] Set up SQLAlchemy and Alembic for migrations.
- [ ] Create `User` model and migrate existing `users.json` data to DB.
- [ ] Implement `login_for_access_token` endpoint returning JWT.

### Phase 2: Security & Middleware
- [ ] Add `get_current_user` dependency for route protection.
- [ ] Implement Refresh Token rotation logic.
- [ ] Add Rate Limiting middleware.

### Phase 3: Frontend Integration
- [ ] Refactor `AuthContext.jsx` to use JWTs.
- [ ] Create an Axios instance with interceptors.
- [ ] Test expiration and auto-logout flows.

## Verification
- **Unit Tests**: Test auth endpoints with `pytest`.
- **Load Tests**: Verify rate limiting works under load.
- **Security Audit**: Check for token leakage in logs/client storage.
